module.exports = [
"[project]/cinehub/cinehub-main/.next-internal/server/app/api/analytics/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[project]/cinehub/cinehub-main/src/app/api/analytics/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$cinehub$2f$cinehub$2d$main$2f$node_modules$2f40$vercel$2f$kv$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/cinehub/cinehub-main/node_modules/@vercel/kv/dist/index.js [app-route] (ecmascript)");
;
const ANALYTICS_KEY = 'analytics:events';
const MAX_EVENTS = 10000;
async function POST(request) {
    try {
        const body = await request.json();
        const { type, componentName } = body;
        const event = {
            type,
            timestamp: Date.now(),
            userAgent: request.headers.get('user-agent') || 'Unknown',
            referrer: request.headers.get('referer') || 'Direct',
            ...componentName && {
                componentName
            }
        };
        // Add event to list
        await __TURBOPACK__imported__module__$5b$project$5d2f$cinehub$2f$cinehub$2d$main$2f$node_modules$2f40$vercel$2f$kv$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].rpush(ANALYTICS_KEY, JSON.stringify(event));
        // Trim list to maintain max size
        await __TURBOPACK__imported__module__$5b$project$5d2f$cinehub$2f$cinehub$2d$main$2f$node_modules$2f40$vercel$2f$kv$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].ltrim(ANALYTICS_KEY, -MAX_EVENTS, -1);
        return Response.json({
            success: true
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return Response.json({
            success: false,
            error: 'Failed to save event'
        }, {
            status: 500
        });
    }
}
async function GET() {
    try {
        // Get all events from KV
        const eventsData = await __TURBOPACK__imported__module__$5b$project$5d2f$cinehub$2f$cinehub$2d$main$2f$node_modules$2f40$vercel$2f$kv$2f$dist$2f$index$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kv"].lrange(ANALYTICS_KEY, 0, -1);
        if (!eventsData || eventsData.length === 0) {
            return Response.json({
                totalPageviews: 0,
                todayPageviews: 0,
                weekPageviews: 0,
                clicksByComponent: {},
                referrers: {},
                tiktokPercentage: 0
            });
        }
        const events = eventsData.map((e)=>JSON.parse(e));
        // Calculate stats
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const pageviews = events.filter((e)=>e.type === 'pageview');
        const clicks = events.filter((e)=>e.type === 'click');
        const totalPageviews = pageviews.length;
        const todayPageviews = pageviews.filter((e)=>e.timestamp > oneDayAgo).length;
        const weekPageviews = pageviews.filter((e)=>e.timestamp > oneWeekAgo).length;
        // Count clicks by component
        const clicksByComponent = {};
        clicks.forEach((event)=>{
            if (event.componentName) {
                clicksByComponent[event.componentName] = (clicksByComponent[event.componentName] || 0) + 1;
            }
        });
        // Count referrers
        const referrers = {};
        pageviews.forEach((event)=>{
            let referrer = 'Direct';
            if (event.referrer && event.referrer !== 'Direct') {
                try {
                    const url = new URL(event.referrer);
                    referrer = url.hostname;
                } catch  {
                    referrer = 'Direct';
                }
            }
            referrers[referrer] = (referrers[referrer] || 0) + 1;
        });
        // Calculate TikTok percentage
        const tiktokViews = pageviews.filter((e)=>e.referrer.toLowerCase().includes('tiktok')).length;
        const tiktokPercentage = totalPageviews > 0 ? Math.round(tiktokViews / totalPageviews * 100) : 0;
        return Response.json({
            totalPageviews,
            todayPageviews,
            weekPageviews,
            clicksByComponent,
            referrers,
            tiktokPercentage
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return Response.json({
            totalPageviews: 0,
            todayPageviews: 0,
            weekPageviews: 0,
            clicksByComponent: {},
            referrers: {},
            tiktokPercentage: 0
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__b43e1923._.js.map