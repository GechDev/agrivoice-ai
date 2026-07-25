<?php

namespace App\Services;

use App\Enums\Crop;

/**
 * Builds Amharic IVR scripts for keypad playback (Addis TTS).
 */
class IvrScriptBuilder
{
    public function __construct(private AmharicNumberSpeech $numbers) {}

    /**
     * @return list<Crop>
     */
    public function menuCrops(): array
    {
        return [
            Crop::Teff,
            Crop::Coffee,
            Crop::Maize,
            Crop::Wheat,
        ];
    }

    public function cropLabelAm(Crop $crop): string
    {
        return match ($crop) {
            Crop::Teff => 'ጤፍ',
            Crop::Coffee => 'ቡና',
            Crop::Maize => 'በቆሎ',
            Crop::Wheat => 'ስንዴ',
            default => $crop->label(),
        };
    }

    public function marketLabelAm(string $slug): string
    {
        return match ($slug) {
            'adama' => 'አዳማ',
            'addis_ababa' => 'አዲስ አበባ',
            'jimma' => 'ጅማ',
            default => $slug,
        };
    }

    public function welcome(): string
    {
        return 'እንኳን ወደ አግሪቮይስ በደህና መጡ። '
            .'የጤፍ ዋጋ ለማወቅ '.$this->numbers->pressForm(1).' ይጫኑ። '
            .'የቡና ዋጋ ለማወቅ '.$this->numbers->pressForm(2).' ይጫኑ። '
            .'የበቆሎ ዋጋ ለማወቅ '.$this->numbers->pressForm(3).' ይጫኑ። '
            .'የስንዴ ዋጋ ለማወቅ '.$this->numbers->pressForm(4).' ይጫኑ። '
            .'እንደገና ለማዳመጥ '.$this->numbers->pressForm(5).' ይጫኑ።';
    }

    /**
     * System prompt for the key-5 Amharic agriculture voice assistant.
     */
    public function assistantSystemPrompt(string $livePricesContext): string
    {
        return implode("\n", [
            'አንተ የአግሪቮይስ የድምፅ ረዳት ነህ። በአማርኛ ብቻ መልስ ስጥ።',
            'ስለ ግብርና፣ የሰብል ዋጋ፣ ገበያዎች፣ እና የገበሬ/አቅራቢ ጥያቄዎች ብቻ መልስ።',
            'ከዚህ ውጭ ለሆኑ ጥያቄዎች በአጭሩ በአማርኛ እምቢ በል እና ወደ የሰብል ዋጋ ጥያቄ መልሰህ ጋብዝ።',
            'መልሶች አጭር፣ ግልጽ፣ እና ለስልክ IVR ተስማሚ ይሁኑ።',
            'ቁጥሮችን በአማርኛ ቃላት ብቻ ጻፍ። አረብኛ አሀዞችን (1፣ 2፣ 8500) አትጠቀም።',
            '',
            'የቀጥታ የገበያ ዋጋ መረጃ:',
            $livePricesContext,
        ]);
    }

    /**
     * @param  list<array{
     *     crop: string,
     *     market: string,
     *     price: float,
     *     confidence: int,
     *     reportCount: int
     * }>  $snapshots
     */
    public function forCrop(Crop $crop, array $snapshots): string
    {
        $parts = [];

        foreach ($snapshots as $snapshot) {
            $market = $this->marketLabelAm($snapshot['market']);

            if (($snapshot['reportCount'] ?? 0) === 0 || ($snapshot['price'] ?? 0) <= 0) {
                $parts[] = "{$market}፦ ውሂብ በመሰብሰብ ላይ።";

                continue;
            }

            $price = $this->numbers->words((int) round((float) $snapshot['price']));
            $confidence = $this->numbers->words((int) $snapshot['confidence']);
            $parts[] = "{$market}፦ {$price} ብር በኩንታል፣ እምነት {$confidence} በመቶ።";
        }

        $cropName = $this->cropLabelAm($crop);

        return "የ{$cropName} የቀጥታ ዋጋ። ".implode(' ', $parts);
    }
}
