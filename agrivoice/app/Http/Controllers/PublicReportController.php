<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePublicReportRequest;
use App\Models\Agent;
use App\Models\Market;
use App\Models\Report;
use Carbon\CarbonInterface;
use Database\Seeders\AgentSeeder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Date;
use Inertia\Inertia;
use Inertia\Response;

class PublicReportController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('report-price', [
            'submitted' => false,
            'markets' => Market::query()
                ->orderBy('name')
                ->get()
                ->map(fn (Market $market) => [
                    'slug' => $market->slug->value,
                    'name' => $market->name,
                    'region' => $market->region,
                ])
                ->values()
                ->all(),
        ]);
    }

    public function store(StorePublicReportRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $market = Market::where('slug', $data['market'])->firstOrFail();
        $publicAgent = Agent::where('name', AgentSeeder::PUBLIC_AGENT_NAME)->firstOrFail();

        Report::create([
            'crop' => $data['crop'],
            'market_id' => $market->id,
            'price' => $data['price'],
            'reporter_type' => 'crowd',
            'source' => 'public_web',
            'agent_id' => $publicAgent->id,
            'reported_at' => $this->resolveReportedAt($data['reported_at']),
            'is_flagged' => false,
            'status' => 'pending',
        ]);

        return redirect()->route('report-price');
    }

    private function resolveReportedAt(string $reportedAt): CarbonInterface
    {
        $observedOn = Date::parse($reportedAt);

        return $observedOn->isToday() ? Date::now() : $observedOn->startOfDay();
    }
}
