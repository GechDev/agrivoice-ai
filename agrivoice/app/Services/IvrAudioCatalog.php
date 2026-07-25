<?php

namespace App\Services;

use Illuminate\Support\Facades\Storage;

/**
 * Fixed Amharic IVR clips generated once via `php artisan ivr:generate-audio`.
 *
 * Keypad numbers are written as Amharic words so Addis TTS does not invent digit names.
 */
class IvrAudioCatalog
{
    public const DISK = 'public';

    public const DIRECTORY = 'ivr';

    public function __construct(private AmharicNumberSpeech $numbers) {}

    /**
     * @return array<string, string> keyed clip id => Amharic text
     */
    public function clips(): array
    {
        return [
            'welcome' => 'እንኳን ወደ አግሪቮይስ በደህና መጡ።',
            'prompt_1' => 'የጤፍ ዋጋ ለማወቅ '.$this->numbers->pressForm(1).' ይጫኑ።',
            'prompt_2' => 'የቡና ዋጋ ለማወቅ '.$this->numbers->pressForm(2).' ይጫኑ።',
            'prompt_3' => 'የበቆሎ ዋጋ ለማወቅ '.$this->numbers->pressForm(3).' ይጫኑ።',
            'prompt_4' => 'የስንዴ ዋጋ ለማወቅ '.$this->numbers->pressForm(4).' ይጫኑ።',
            'prompt_5' => 'እንደገና ለማዳመጥ '.$this->numbers->pressForm(5).' ይጫኑ።',
        ];
    }

    /**
     * Ordered startup menu playback (welcome + keypad prompts).
     *
     * @return list<string>
     */
    public function startupQueue(): array
    {
        return [
            'welcome',
            'prompt_1',
            'prompt_2',
            'prompt_3',
            'prompt_4',
            'prompt_5',
        ];
    }

    public function relativePath(string $clipId): string
    {
        return self::DIRECTORY.'/'.$clipId.'.mp3';
    }

    public function publicUrl(string $clipId): ?string
    {
        $path = $this->relativePath($clipId);

        if (! Storage::disk(self::DISK)->exists($path)) {
            return null;
        }

        return Storage::disk(self::DISK)->url($path)
            .'?v='.Storage::disk(self::DISK)->lastModified($path);
    }

    /**
     * @return array<string, string|null>
     */
    public function publicUrls(): array
    {
        $urls = [];

        foreach (array_keys($this->clips()) as $clipId) {
            $urls[$clipId] = $this->publicUrl($clipId);
        }

        return $urls;
    }

    /**
     * Deterministic idempotency key for Addis Voices 2.
     */
    public function clientRequestId(string $clipId, string $voiceId): string
    {
        $text = $this->clips()[$clipId] ?? $clipId;

        return 'ivr-'.$clipId.'-'.substr(hash('sha256', $voiceId.'|'.$text), 0, 24);
    }
}
