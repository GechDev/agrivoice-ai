<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $summary['cooperative']['name'] }} weekly prices</title>
    <style>
        @page { margin: 28px; }
        body { color: #000; font-family: DejaVu Sans, sans-serif; font-size: 10px; }
        h1 { font-size: 20px; margin: 0 0 4px; }
        p { margin: 0 0 7px; }
        .meta { border-bottom: 2px solid #000; margin-bottom: 14px; padding-bottom: 10px; }
        .definition { border: 1px solid #000; margin-bottom: 14px; padding: 8px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #000; padding: 7px; text-align: left; vertical-align: top; }
        th { background: #eee; font-size: 9px; text-transform: uppercase; }
        .number { text-align: right; }
        .empty { padding: 24px; text-align: center; }
        .footer { margin-top: 12px; font-size: 8px; }
    </style>
</head>
<body>
    <div class="meta">
        <h1>Weekly crop price summary</h1>
        <p><strong>{{ $summary['cooperative']['name'] }}</strong> &mdash; {{ $summary['cooperative']['region'] }}</p>
        <p>{{ $summary['period']['from'] }} to {{ $summary['period']['to'] }} | Generated {{ $generatedAt->format('M j, Y H:i T') }}</p>
    </div>

    <div class="definition">
        <strong>Regional benchmark:</strong> {{ $summary['definition'] }}
        {{ $summary['regionalMarketsCount'] }} eligible regional {{ Illuminate\Support\Str::plural('market', $summary['regionalMarketsCount']) }} considered.
        Trend compares the cooperative's current seven-day average with its previous seven-day average; movement under 1% is stable.
    </div>

    <table>
        <thead>
            <tr>
                <th>Crop</th>
                <th>Market</th>
                <th class="number">Cooperative price</th>
                <th class="number">Regional average</th>
                <th class="number">Vs regional</th>
                <th>Weekly trend</th>
                <th>As of</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($summary['rows'] as $row)
                <tr>
                    <td>{{ $row['cropLabel'] }}</td>
                    <td>{{ $row['market'] }}</td>
                    <td class="number">{{ $row['currentPrice'] === null ? 'No data' : number_format($row['currentPrice'], 2).' ETB' }}</td>
                    <td class="number">
                        {{ $row['regionalAverage'] === null ? 'No data' : number_format($row['regionalAverage'], 2).' ETB' }}
                        @if ($row['regionalAverage'] !== null)
                            <br>({{ $row['regionalMarketCount'] }} {{ Illuminate\Support\Str::plural('market', $row['regionalMarketCount']) }})
                        @endif
                    </td>
                    <td class="number">
                        {{ $row['comparisonPercentage'] === null ? 'N/A' : ($row['comparisonPercentage'] > 0 ? '+' : '').number_format($row['comparisonPercentage'], 1).'%' }}
                    </td>
                    <td>
                        @if ($row['trend'] === 'up')
                            [UP] Up {{ number_format(abs($row['trendPercentage']), 1) }}%
                        @elseif ($row['trend'] === 'down')
                            [DOWN] Down {{ number_format(abs($row['trendPercentage']), 1) }}%
                        @elseif ($row['trend'] === 'stable')
                            [STABLE] Stable {{ number_format(abs($row['trendPercentage']), 1) }}%
                        @else
                            [N/A] Previous period unavailable
                        @endif
                    </td>
                    <td>{{ $row['asOf'] === null ? 'No reports' : date('M j, Y', strtotime($row['asOf'])) }}</td>
                </tr>
            @empty
                <tr><td class="empty" colspan="7">No tracked crops or regional markets are configured.</td></tr>
            @endforelse
        </tbody>
    </table>

    <p class="footer">Prices are averages of verified, unflagged reports and are shown in Ethiopian birr (ETB).</p>
</body>
</html>
