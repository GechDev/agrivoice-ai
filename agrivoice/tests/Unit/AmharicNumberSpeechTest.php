<?php

use App\Services\AmharicNumberSpeech;
use App\Services\IvrAudioCatalog;

test('amharic number speech spells keypad digits as words', function () {
    $numbers = app(AmharicNumberSpeech::class);

    expect($numbers->pressForm(1))->toBe('አንድን')
        ->and($numbers->pressForm(2))->toBe('ሁለትን')
        ->and($numbers->pressForm(5))->toBe('አምስትን')
        ->and($numbers->words(8500))->toBe('ስምንት ሺህ አምስት መቶ')
        ->and($numbers->words(100))->toBe('መቶ');
});

test('ivr audio catalog menu prompts avoid arabic digits', function () {
    $clips = app(IvrAudioCatalog::class)->clips();

    foreach (['prompt_1', 'prompt_2', 'prompt_3', 'prompt_4', 'prompt_5'] as $clipId) {
        expect($clips[$clipId])->not->toMatch('/[0-9]/');
    }

    expect($clips['prompt_1'])->toContain('አንድን')
        ->and($clips['prompt_5'])->toBe('እንደገና ለማዳመጥ አምስትን ይጫኑ።');
});
