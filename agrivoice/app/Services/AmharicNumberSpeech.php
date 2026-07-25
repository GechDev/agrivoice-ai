<?php

namespace App\Services;

/**
 * Converts integers to Amharic words for Addis TTS (digits are often misread).
 */
class AmharicNumberSpeech
{
    /**
     * @var array<int, string>
     */
    private const ONES = [
        0 => 'ዜሮ',
        1 => 'አንድ',
        2 => 'ሁለት',
        3 => 'ሶስት',
        4 => 'አራት',
        5 => 'አምስት',
        6 => 'ስድስት',
        7 => 'ሰባት',
        8 => 'ስምንት',
        9 => 'ዘጠኝ',
        10 => 'አስር',
        11 => 'አስራ አንድ',
        12 => 'አስራ ሁለት',
        13 => 'አስራ ሶስት',
        14 => 'አስራ አራት',
        15 => 'አስራ አምስት',
        16 => 'አስራ ስድስት',
        17 => 'አስራ ሰባት',
        18 => 'አስራ ስምንት',
        19 => 'አስራ ዘጠኝ',
    ];

    /**
     * @var array<int, string>
     */
    private const TENS = [
        2 => 'ሀያ',
        3 => 'ሰላሳ',
        4 => 'አርባ',
        5 => 'ሀምሳ',
        6 => 'ስልሳ',
        7 => 'ሰባ',
        8 => 'ሰማንያ',
        9 => 'ዘጠና',
    ];

    public function words(int $number): string
    {
        if ($number < 0) {
            return 'ማይነስ '.$this->words(abs($number));
        }

        if ($number < 20) {
            return self::ONES[$number];
        }

        if ($number < 100) {
            $ten = intdiv($number, 10);
            $rem = $number % 10;

            return $rem === 0
                ? self::TENS[$ten]
                : self::TENS[$ten].' '.self::ONES[$rem];
        }

        if ($number < 1000) {
            $hundreds = intdiv($number, 100);
            $rem = $number % 100;
            $head = $hundreds === 1 ? 'መቶ' : self::ONES[$hundreds].' መቶ';

            return $rem === 0 ? $head : $head.' '.$this->words($rem);
        }

        if ($number < 1000000) {
            $thousands = intdiv($number, 1000);
            $rem = $number % 1000;
            $head = $thousands === 1 ? 'ሺህ' : $this->words($thousands).' ሺህ';

            return $rem === 0 ? $head : $head.' '.$this->words($rem);
        }

        $millions = intdiv($number, 1000000);
        $rem = $number % 1000000;
        $head = $millions === 1 ? 'ሚሊዮን' : $this->words($millions).' ሚሊዮን';

        return $rem === 0 ? $head : $head.' '.$this->words($rem);
    }

    /**
     * Object form used in “press N” prompts, e.g. አንድን / ሁለትን.
     */
    public function pressForm(int $digit): string
    {
        return match ($digit) {
            1 => 'አንድን',
            2 => 'ሁለትን',
            3 => 'ሶስትን',
            4 => 'አራትን',
            5 => 'አምስትን',
            6 => 'ስድስትን',
            7 => 'ሰባትን',
            8 => 'ስምንትን',
            9 => 'ዘጠኝን',
            0 => 'ዜሮን',
            default => $this->words($digit).'ን',
        };
    }
}
