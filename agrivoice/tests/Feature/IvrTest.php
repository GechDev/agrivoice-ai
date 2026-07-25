<?php

use App\Models\Market;
use App\Models\User;
use App\Services\IvrAudioCatalog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from the ivr simulator', function () {
    $this->get(route('ivr.index'))->assertRedirect(route('login'));
});

test('authenticated users see centered keypad props with startup clips', function () {
    config(['services.addis_ai.api_key' => null]);

    Storage::fake('public');
    $catalog = app(IvrAudioCatalog::class);
    Storage::disk('public')->put($catalog->relativePath('welcome'), 'audio');
    Storage::disk('public')->put($catalog->relativePath('prompt_1'), 'audio');

    Market::factory()->adama()->create();
    Market::factory()->addisAbaba()->create();
    Market::factory()->jimma()->create();

    $this->actingAs(User::factory()->create());

    $this->get(route('ivr.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('ivr')
            ->has('menuOptions', 5)
            ->where('menuOptions.0.key', '1')
            ->where('menuOptions.0.crop', 'teff')
            ->where('menuOptions.4.key', '5')
            ->where('menuOptions.4.crop', null)
            ->has('cropScripts.teff')
            ->where('addisConfigured', false)
            ->has('startupQueue')
            ->has('clipUrls.welcome')
        );
});

test('ivr speak returns service unavailable when addis api key is missing', function () {
    config(['services.addis_ai.api_key' => null]);

    $this->actingAs(User::factory()->create());

    $this->postJson(route('ivr.speak'), [
        'text' => 'የጤፍ ዋጋ ለማወቅ አንድን ይጫኑ።',
    ])->assertServiceUnavailable()
        ->assertJsonFragment([
            'message' => 'Addis AI is not configured. Set ADDIS_AI_API_KEY in your environment.',
        ]);
});

test('ivr speak caches generated audio on the public disk', function () {
    config(['services.addis_ai.api_key' => 'sk_test_key']);
    Storage::fake('public');

    Http::fake([
        'https://api.addisassistant.com/api/v1/voice/generations' => Http::response([
            'audio_url' => 'https://cdn.example.com/welcome.mp3',
        ]),
        'https://cdn.example.com/welcome.mp3' => Http::response('mp3-bytes'),
    ]);

    $this->actingAs(User::factory()->create());

    $first = $this->postJson(route('ivr.speak'), [
        'text' => 'እንኳን ወደ አግሪቮይስ በደህና መጡ።',
    ])->assertOk()
        ->json();

    expect($first['audioUrl'])->toBeString()
        ->and($first['audioUrl'])->toContain('/storage/ivr/cache/');

    $this->postJson(route('ivr.speak'), [
        'text' => 'እንኳን ወደ አግሪቮይስ በደህና መጡ።',
    ])->assertOk();

    Http::assertSentCount(2); // one generation + one download; second speak hits cache only
});

test('ivr generate audio command stores fixed clips', function () {
    config([
        'services.addis_ai.api_key' => 'sk_test_key',
        'services.addis_ai.voice_id' => 'am-hamen',
    ]);
    Storage::fake('public');

    Http::fake([
        'https://api.addisassistant.com/api/v1/voice/estimate' => Http::response([
            'estimated_cost' => 0.1,
            'currency' => 'ETB',
        ]),
        'https://api.addisassistant.com/api/v1/voice/generations' => Http::response([
            'audio_url' => 'https://cdn.example.com/clip.mp3',
        ]),
        'https://cdn.example.com/clip.mp3' => Http::response('clip-bytes'),
    ]);

    $this->artisan('ivr:generate-audio', ['--yes' => true])
        ->assertSuccessful();

    $catalog = app(IvrAudioCatalog::class);

    foreach (array_keys($catalog->clips()) as $clipId) {
        Storage::disk('public')->assertExists($catalog->relativePath($clipId));
    }
});
