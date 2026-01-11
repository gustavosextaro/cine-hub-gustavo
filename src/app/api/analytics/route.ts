import { db } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { NextRequest } from 'next/server';

interface AnalyticsEvent {
  type: 'pageview' | 'click';
  timestamp: number;
  userAgent: string;
  referrer: string;
  componentName?: string;
}

// Helper to getting date string YYYY-MM-DD
function getDateString() {
  return new Date().toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, component } = body;
    const date = getDateString();

    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      userAgent: request.headers.get('user-agent') || 'Unknown',
      referrer: request.headers.get('referer') || 'Direct',
      ...(component && { componentName: component }),
    };

    // 1. Save raw event (for historical backup)
    const eventRef = db.collection('analytics').doc();
    
    // 2. Atomic increments for aggregates
    const statsRef = db.collection('aggregates').doc('stats');
    const dailyRef = db.collection('aggregates').doc(`daily_${date}`);

    await db.runTransaction(async (transaction) => {
      // Create aggregators if they don't exist
      const statsDoc = await transaction.get(statsRef);
      if (!statsDoc.exists) {
        transaction.set(statsRef, { totalPageviews: 0, tiktokVisits: 0, clicks: {} });
      }
      
      const dailyDoc = await transaction.get(dailyRef);
      if (!dailyDoc.exists) {
        transaction.set(dailyRef, { pageviews: 0 });
      }

      // Prepare updates
      const increment = (n: number) => FieldValue.increment(n);
      
      if (type === 'pageview') {
        transaction.update(statsRef, { totalPageviews: increment(1) });
        transaction.update(dailyRef, { pageviews: increment(1) });

        // Track TikTok source
        if (event.referrer.toLowerCase().includes('tiktok')) {
          transaction.update(statsRef, { tiktokVisits: increment(1) });
        }
      } else if (type === 'click' && component) {
        // Nested field update for clicks
        transaction.update(statsRef, { [`clicks.${component}`]: increment(1) });
      }

      // Perform the raw insert
      transaction.set(eventRef, event);
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ success: false, error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Optimized Read: Just 2 documents instead of thousands
    const statsDoc = await db.collection('aggregates').doc('stats').get();
    const date = getDateString();
    const dailyDoc = await db.collection('aggregates').doc(`daily_${date}`).get();

    if (!statsDoc.exists) {
      return Response.json({
        totalPageviews: 0,
        todayPageviews: 0,
        clicksByComponent: {},
        tiktokPercentage: 0,
      });
    }

    const data = statsDoc.data() || {};
    const dailyData = dailyDoc.data() || { pageviews: 0 };

    // Calculate derived metrics
    const totalPageviews = data.totalPageviews || 0;
    const tiktokVisits = data.tiktokVisits || 0;
    const tiktokPercentage = totalPageviews > 0 
      ? Math.round((tiktokVisits / totalPageviews) * 100) 
      : 0;

    return Response.json({
      totalPageviews,
      todayPageviews: dailyData.pageviews || 0,
      weekPageviews: 0, // Simplified for performance (can be re-added later with weekly aggregators)
      clicksByComponent: data.clicks || {},
      referrers: {}, // Simplified
      tiktokPercentage,
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return Response.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}
