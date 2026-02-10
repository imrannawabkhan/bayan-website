import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb'; // Remove ObjectId import

// -----------------
// MongoDB Connection
// -----------------
const uri = process.env.MONGODB_URI;
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not set');
  }
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

// -----------------
// API Handlers
// -----------------

// GET - Fetch news
export async function GET(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('news');

    const url = new URL(req.url);
    const category = url.searchParams.get('category') || 'all';
    const id = url.searchParams.get('id');

    // Get specific news item by ID
    if (id) {
      const newsItem = await collection.findOne({ id: parseInt(id) });
      if (!newsItem) {
        return NextResponse.json({ error: 'News item not found' }, { status: 404 });
      }
      return NextResponse.json(newsItem);
    }

    // Build query for category filter
    const query = category === 'all' ? {} : { category };

    // Fetch news and sort by newest
    const newsItems = await collection.find(query).sort({ date: -1 }).toArray();

    return NextResponse.json({ news: newsItems || [] });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ news: [] });
  }
}

// POST - Add new news
export async function POST(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('news');

    const body = await req.json();
    
    // Get the highest ID and increment
    const lastNews = await collection.findOne({}, { sort: { id: -1 } });
    const newId = lastNews ? lastNews.id + 1 : 1;

    const newsItem = {
      ...body,
      id: newId,
      date: body.date || new Date().toISOString().split('T')[0],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newsItem);
    
    return NextResponse.json({ 
      success: true, 
      news: { ...newsItem, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
  }
}

// PUT - Update news
export async function PUT(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('news');

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    const result = await collection.updateOne(
      { id: parseInt(id) },
      { 
        $set: { 
          ...updateData, 
          updatedAt: new Date() 
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'News updated successfully' });
  } catch (error) {
    console.error('Error updating news:', error);
    return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
  }
}

// DELETE - Delete news
export async function DELETE(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('news');

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'News ID is required' }, { status: 400 });
    }

    const result = await collection.deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'News item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'News deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
  }
}
