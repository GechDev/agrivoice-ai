<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Services\CooperativePriceService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class CooperativePriceController extends CooperativeController
{
    public function __construct(private CooperativePriceService $prices) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', Report::class);

        return Inertia::render('Cooperative/Prices/Index', [
            'summary' => $this->prices->summary($this->cooperative($request)),
        ]);
    }

    public function download(Request $request): HttpResponse
    {
        $this->authorize('viewAny', Report::class);
        $summary = $this->prices->summary($this->cooperative($request));
        $filename = Str::slug($summary['cooperative']['name']).'-weekly-prices-'.$summary['period']['to'].'.pdf';

        return Pdf::loadView('pdf.cooperative-weekly-prices', [
            'summary' => $summary,
            'generatedAt' => now(),
        ])->setPaper('a4', 'landscape')->download($filename);
    }
}
