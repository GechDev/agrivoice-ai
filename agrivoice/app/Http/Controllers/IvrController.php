<?php

namespace App\Http\Controllers;

use App\Enums\Crop;
use App\Http\Requests\IvrSpeakRequest;
use App\Http\Resources\PriceSnapshotResource;
use App\Services\AddisAiVoiceService;
use App\Services\IvrAudioCatalog;
use App\Services\IvrScriptBuilder;
use App\Services\SnapshotService;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

/**
 * Browser simulation of AgriVoice IVR — Amharic keypad + Addis voice.
 *
 * Keys 1–4 announce live prices for Teff, Coffee, Maize, Wheat.
 * Key 5 replays the menu.
 */
class IvrController extends Controller
{
    public function __construct(
        private SnapshotService $snapshotService,
        private AddisAiVoiceService $addisAiVoiceService,
        private IvrScriptBuilder $scripts,
        private IvrAudioCatalog $audioCatalog,
    ) {}

    public function index(): Response
    {
        $menuCrops = $this->scripts->menuCrops();
        $menuSlugs = array_map(fn (Crop $crop) => $crop->value, $menuCrops);

        $snapshots = collect($this->snapshotService->all())
            ->filter(fn (array $snapshot) => in_array($snapshot['crop'], $menuSlugs, true))
            ->map(fn (array $snapshot) => (new PriceSnapshotResource($snapshot))->resolve())
            ->values()
            ->all();

        $cropScripts = [];

        foreach ($menuCrops as $crop) {
            $forCrop = array_values(array_filter(
                $snapshots,
                fn (array $snapshot) => $snapshot['crop'] === $crop->value,
            ));
            $cropScripts[$crop->value] = $this->scripts->forCrop($crop, $forCrop);
        }

        $clipUrls = $this->audioCatalog->publicUrls();

        return Inertia::render('ivr', [
            'menuOptions' => [
                ...collect($menuCrops)->map(fn (Crop $crop, int $index) => [
                    'key' => (string) ($index + 1),
                    'crop' => $crop->value,
                    'label' => $this->scripts->cropLabelAm($crop),
                ])->all(),
                [
                    'key' => '5',
                    'crop' => null,
                    'label' => 'መድገም',
                ],
            ],
            'cropScripts' => $cropScripts,
            'clipUrls' => $clipUrls,
            'startupQueue' => collect($this->audioCatalog->startupQueue())
                ->map(fn (string $clipId) => $clipUrls[$clipId] ?? null)
                ->filter()
                ->values()
                ->all(),
            'addisConfigured' => $this->addisAiVoiceService->isConfigured(),
        ]);
    }

    public function speak(IvrSpeakRequest $request): JsonResponse
    {
        if (! $this->addisAiVoiceService->isConfigured()) {
            return response()->json([
                'message' => 'Addis AI is not configured. Set ADDIS_AI_API_KEY in your environment.',
            ], HttpResponse::HTTP_SERVICE_UNAVAILABLE);
        }

        try {
            $speech = $this->addisAiVoiceService->speak($request->string('text')->toString());
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], HttpResponse::HTTP_BAD_GATEWAY);
        }

        return response()->json([
            'text' => $request->string('text')->toString(),
            'audioUrl' => $speech['audioUrl'],
            'audioBase64' => $speech['audioBase64'],
        ]);
    }
}
