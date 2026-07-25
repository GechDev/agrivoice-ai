/** Curated media for the marketing landing page (external CDN — no repo bloat). */

export const LANDING_IMAGES = {
    hero:
        'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=2400&q=80',
    farmer:
        'https://images.unsplash.com/photo-1593113598332-cd288d649051?auto=format&fit=crop&w=1600&q=80',
    market:
        'https://images.unsplash.com/photo-1574943329822-797105873a98?auto=format&fit=crop&w=1600&q=80',
    coffee:
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1600&q=80',
    teff: 'https://images.unsplash.com/photo-1628009368231-7bb8cfc8b9c8?auto=format&fit=crop&w=1600&q=80',
    cooperative:
        'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1600&q=80',
} as const;

export const LANDING_VIDEOS = {
    /** Muted loop for hero ambience — Pexels, free license */
    hero:
        'https://videos.pexels.com/video-files/4057255/4057255-hd_1920_1080_25fps.mp4',
    /** Ethiopian agriculture context — YouTube embed */
    demoEmbed: 'https://www.youtube.com/embed/8rWSG-MSE4g?rel=0&modestbranding=1',
} as const;

export const BUSINESS_STATS = [
    { value: '6', label: 'Live market tiles', detail: 'Teff & coffee × 3 cities' },
    { value: '2–3s', label: 'Refresh cycle', detail: 'Polling built for demo wifi' },
    { value: '100%', label: 'Reported prices', detail: 'Never fabricated aggregates' },
    { value: '3', label: 'Languages', detail: 'Amharic, Afaan Oromoo, English' },
] as const;

export const PRODUCT_SLICES = [
    {
        title: 'Live dashboard',
        description:
            'Six crop×market tiles with confidence %, trend arrows, and a live map — the projector screen for judges and cooperatives.',
        image: LANDING_IMAGES.market,
        tag: 'Tsegaye · Dashboard',
    },
    {
        title: 'Agent entry portal',
        description:
            'Named agents log in with a PIN, enter a farmer’s price in seconds, and see their own recent submissions.',
        image: LANDING_IMAGES.farmer,
        tag: 'Gezachew · Data entry',
    },
    {
        title: 'Live data list',
        description:
            'Every report appears newest-first with agent attribution. Flag outliers so bad data never poisons aggregates.',
        image: LANDING_IMAGES.teff,
        tag: 'Nati · Moderation',
    },
] as const;

export const REVENUE_STREAMS = [
    {
        title: 'Cooperative SaaS',
        description:
            'Weekly price PDFs, member dashboards, and billing for unions that need structured market intelligence.',
    },
    {
        title: 'Trader & exporter API',
        description:
            'Confidence-scored price feeds for buyers sourcing teff and coffee across Adama, Addis, and Jimma.',
    },
    {
        title: 'NGO & donor reporting',
        description:
            'Transparent, attributable price history for food-security and livelihood programs.',
    },
    {
        title: 'Agri-input cross-sell',
        description:
            'When farmers know the price, they know when to invest — seed, fertilizer, and storage partnerships.',
    },
] as const;
