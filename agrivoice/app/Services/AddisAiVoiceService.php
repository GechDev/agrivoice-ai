<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Addis AI voice stack for the Amharic IVR simulator:
 * TTS (with optional local cache), STT, and agriculture chat.
 */
class AddisAiVoiceService
{
    private const BASE_URL = 'https://api.addisassistant.com';

    public function __construct(private IvrAudioCatalog $catalog) {}

    public function isConfigured(): bool
    {
        $apiKey = config('services.addis_ai.api_key');

        return is_string($apiKey) && $apiKey !== '';
    }

    public function voiceId(): string
    {
        $voiceId = config('services.addis_ai.voice_id', 'am-hamen');

        return is_string($voiceId) && $voiceId !== '' ? $voiceId : 'am-hamen';
    }

    /**
     * Convert Amharic text to speech, caching dynamic clips under storage/public/ivr/cache.
     *
     * @return array{audioUrl: string|null, audioBase64: string|null}
     */
    public function speak(string $text, bool $cache = true): array
    {
        $apiKey = $this->requireApiKey();
        $trimmed = trim($text);

        if ($trimmed === '') {
            throw new RuntimeException('Speech text cannot be empty.');
        }

        $cacheRelative = $this->cacheRelativePath($trimmed);

        if ($cache && Storage::disk(IvrAudioCatalog::DISK)->exists($cacheRelative)) {
            return [
                'audioUrl' => Storage::disk(IvrAudioCatalog::DISK)->url($cacheRelative),
                'audioBase64' => null,
            ];
        }

        $payload = $this->generateClip($apiKey, $trimmed, (string) Str::uuid());

        $audioUrl = $this->extractAudioUrl($payload);
        $audioBase64 = $this->extractAudioBase64($payload);

        if ($cache && ($audioUrl !== null || $audioBase64 !== null)) {
            $stored = $this->storeBinary(
                $cacheRelative,
                $this->resolveAudioBinary($audioUrl, $audioBase64),
            );

            return [
                'audioUrl' => $stored,
                'audioBase64' => null,
            ];
        }

        return [
            'audioUrl' => $audioUrl,
            'audioBase64' => $audioBase64,
        ];
    }

    /**
     * Generate a fixed catalog clip and persist it under storage/app/public/ivr.
     */
    public function generateAndStoreClip(string $clipId, string $text, string $clientRequestId): string
    {
        $apiKey = $this->requireApiKey();
        $payload = $this->generateClip($apiKey, $text, $clientRequestId);
        $relative = $this->catalog->relativePath($clipId);
        $binary = $this->resolveAudioBinary(
            $this->extractAudioUrl($payload),
            $this->extractAudioBase64($payload),
        );

        return $this->storeBinary($relative, $binary);
    }

    /**
     * Estimate Addis Voices 2 cost for a text clip.
     *
     * @return array<string, mixed>
     */
    public function estimate(string $text): array
    {
        $apiKey = $this->requireApiKey();

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout(30)
                ->post(self::BASE_URL.'/api/v1/voice/estimate', [
                    'text' => trim($text),
                    'voice_id' => $this->voiceId(),
                    'language' => 'am',
                    'output_format' => 'mp3_44100',
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Could not reach Addis AI estimate endpoint.', 0, $exception);
        }

        if (! $response->successful()) {
            throw new RuntimeException('Addis AI estimate failed: '.$response->body());
        }

        /** @var array<string, mixed> $json */
        $json = $response->json() ?? [];

        return is_array(data_get($json, 'data')) ? data_get($json, 'data') : $json;
    }

    /**
     * Transcribe Amharic speech via Addis STT v2.
     */
    public function transcribe(UploadedFile|string $audio): string
    {
        $apiKey = $this->requireApiKey();

        $filename = 'recording.webm';
        $contents = null;
        $mime = 'audio/webm';

        if ($audio instanceof UploadedFile) {
            $filename = $audio->getClientOriginalName() ?: $filename;
            $contents = $audio->get();
            if ($contents === '' || $contents === false) {
                $path = $audio->getRealPath();
                $contents = is_string($path) && $path !== ''
                    ? (file_get_contents($path) ?: '')
                    : '';
            }
            $mime = $audio->getMimeType() ?: $mime;
        } else {
            $contents = $audio;
        }

        if (! is_string($contents) || $contents === '') {
            throw new RuntimeException('Audio recording is empty.');
        }

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
            ])
                ->timeout(90)
                ->attach('audio', $contents, $filename, ['Content-Type' => $mime])
                ->post(self::BASE_URL.'/api/v2/stt', [
                    'request_data' => json_encode(['language_code' => 'am'], JSON_THROW_ON_ERROR),
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Could not reach Addis AI speech-to-text.', 0, $exception);
        }

        if (! $response->successful()) {
            throw new RuntimeException('Addis AI speech-to-text failed: '.$response->body());
        }

        /** @var array<string, mixed> $payload */
        $payload = $response->json() ?? [];

        $text = data_get($payload, 'data.transcription')
            ?? data_get($payload, 'transcription')
            ?? data_get($payload, 'text')
            ?? data_get($payload, 'data.text');

        if (! is_string($text) || trim($text) === '') {
            throw new RuntimeException('Addis AI speech-to-text returned empty transcription.');
        }

        return trim($text);
    }

    /**
     * Ask Addis chat for an Amharic agriculture/market answer.
     *
     * @param  list<array{role: string, content: string}>  $history
     */
    public function chat(string $userMessage, string $systemPrompt, array $history = []): string
    {
        $apiKey = $this->requireApiKey();

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
            ...$history,
            ['role' => 'user', 'content' => $userMessage],
        ];

        $prompt = collect($messages)
            ->map(fn (array $message) => strtoupper($message['role']).': '.$message['content'])
            ->implode("\n\n");

        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout(60)
                ->post(self::BASE_URL.'/api/v1/chat_generate', [
                    'prompt' => $prompt,
                    'target_language' => 'am',
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Could not reach Addis AI chat.', 0, $exception);
        }

        if (! $response->successful()) {
            throw new RuntimeException('Addis AI chat failed: '.$response->body());
        }

        /** @var array<string, mixed> $payload */
        $payload = $response->json() ?? [];

        $text = data_get($payload, 'response_text')
            ?? data_get($payload, 'data.response_text')
            ?? data_get($payload, 'choices.0.message.content')
            ?? data_get($payload, 'text');

        if (! is_string($text) || trim($text) === '') {
            throw new RuntimeException('Addis AI chat returned an empty response.');
        }

        return trim($text);
    }

    /**
     * @return array<string, mixed>
     */
    private function generateClip(string $apiKey, string $text, string $clientRequestId): array
    {
        try {
            $response = Http::withHeaders([
                'x-api-key' => $apiKey,
                'Content-Type' => 'application/json',
            ])
                ->timeout(60)
                ->post(self::BASE_URL.'/api/v1/voice/generations', [
                    'text' => $text,
                    'voice_id' => $this->voiceId(),
                    'language' => 'am',
                    'output_format' => 'mp3_44100',
                    'client_request_id' => $clientRequestId,
                ]);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Could not reach Addis AI text-to-speech.', 0, $exception);
        }

        if (! $response->successful()) {
            throw new RuntimeException('Addis AI text-to-speech failed: '.$response->body());
        }

        /** @var array<string, mixed> $payload */
        $payload = $response->json() ?? [];

        return is_array(data_get($payload, 'data'))
            ? array_merge($payload, data_get($payload, 'data'))
            : $payload;
    }

    private function requireApiKey(): string
    {
        $apiKey = config('services.addis_ai.api_key');

        if (! is_string($apiKey) || $apiKey === '') {
            throw new RuntimeException('Addis AI is not configured. Set ADDIS_AI_API_KEY in your environment.');
        }

        return $apiKey;
    }

    private function cacheRelativePath(string $text): string
    {
        $hash = hash('sha256', $this->voiceId().'|'.$text);

        return IvrAudioCatalog::DIRECTORY.'/cache/'.$hash.'.mp3';
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function extractAudioUrl(array $payload): ?string
    {
        $audioUrl = data_get($payload, 'audio_url')
            ?? data_get($payload, 'audioUrl')
            ?? data_get($payload, 'data.audio_url');

        return is_string($audioUrl) && $audioUrl !== '' ? $audioUrl : null;
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function extractAudioBase64(array $payload): ?string
    {
        $audioBase64 = data_get($payload, 'audio')
            ?? data_get($payload, 'audio_base64')
            ?? data_get($payload, 'data.audio');

        if (! is_string($audioBase64) || $audioBase64 === '') {
            return null;
        }

        if (str_starts_with($audioBase64, 'data:')) {
            $parts = explode(',', $audioBase64, 2);

            return $parts[1] ?? null;
        }

        return $audioBase64;
    }

    private function resolveAudioBinary(?string $audioUrl, ?string $audioBase64): string
    {
        if (is_string($audioBase64) && $audioBase64 !== '') {
            $decoded = base64_decode($audioBase64, true);

            if ($decoded !== false && $decoded !== '') {
                return $decoded;
            }
        }

        if (! is_string($audioUrl) || $audioUrl === '') {
            throw new RuntimeException('Addis AI text-to-speech returned no audio.');
        }

        if (str_starts_with($audioUrl, 'data:')) {
            $parts = explode(',', $audioUrl, 2);
            $decoded = base64_decode($parts[1] ?? '', true);

            if ($decoded === false || $decoded === '') {
                throw new RuntimeException('Addis AI data URL could not be decoded.');
            }

            return $decoded;
        }

        try {
            $response = Http::timeout(60)->get($audioUrl);
        } catch (ConnectionException $exception) {
            throw new RuntimeException('Could not download Addis AI audio clip.', 0, $exception);
        }

        if (! $response->successful() || $response->body() === '') {
            throw new RuntimeException('Failed to download Addis AI audio clip.');
        }

        return $response->body();
    }

    private function storeBinary(string $relativePath, string $binary): string
    {
        Storage::disk(IvrAudioCatalog::DISK)->put($relativePath, $binary);

        return Storage::disk(IvrAudioCatalog::DISK)->url($relativePath);
    }
}
