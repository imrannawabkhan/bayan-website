// app/api/partners/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { promises as fs } from 'fs';
import path from 'path';

// -----------------
// MongoDB Connection
// -----------------
const uri = process.env.MONGODB_URI;
let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  console.log('Attempting to connect to MongoDB for partners...');
  
  if (!uri) {
    throw new Error('MongoDB URI is not defined');
  }
  
  if (cachedClient) {
    console.log('Using cached MongoDB connection');
    return cachedClient;
  }

  try {
    console.log('Creating new MongoDB connection...');
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    await client.connect();
    console.log('MongoDB connected successfully for partners');
    
    await client.db('bayanmed').admin().ping();
    console.log('MongoDB ping successful');
    
    cachedClient = client;
    return client;
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

// -----------------
// API Handlers
// -----------------

// GET - Fetch partners
export async function GET(req: NextRequest) {
  console.log('GET /api/partners called');
  
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('partners');

    console.log('Fetching partners from database...');
    
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    // Get specific partner by ID
    if (id) {
      console.log('Fetching partner by ID:', id);
      const partner = await collection.findOne({ id: parseInt(id) });
      if (!partner) {
        return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
      }
      return NextResponse.json(partner);
    }

    // Fetch all partners and sort by name
    const partners = await collection.find({}).sort({ name: 1 }).toArray();
    console.log('Found partners:', partners.length);

    return NextResponse.json(partners);
  } catch (dbError) {
    console.error('Database connection failed, falling back to local data file:', dbError);
    
    try {
      // Fallback to local JSON file
      const filePath = path.join(process.cwd(), 'public', 'partners.json');
      const fileContents = await fs.readFile(filePath, 'utf8');
      const partners = JSON.parse(fileContents);
      
      const url = new URL(req.url);
      const id = url.searchParams.get('id');
      
      if (id) {
        const partner = partners.find((p: any) => p.id === parseInt(id));
        if (!partner) {
          return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
        }
        return NextResponse.json(partner);
      }
      
      // Sort by name
      partners.sort((a: any, b: any) => a.name.localeCompare(b.name));
      console.log('Loaded partners from local file:', partners.length);
      
      return NextResponse.json(partners);
    } catch (fileError) {
      console.error('Error reading local data file:', fileError);
      return NextResponse.json({ 
        error: 'Database and local data file both failed', 
        message: 'Unable to retrieve partner data'
      }, { status: 500 });
    }
  }
}

// POST - Add new partner
export async function POST(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('partners');

    const body = await req.json();
    
    // Get the highest ID and increment
    const lastPartner = await collection.findOne({}, { sort: { id: -1 } });
    const newId = lastPartner ? lastPartner.id + 1 : 1;

    const partner = {
      ...body,
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(partner);
    
    return NextResponse.json({ 
      success: true, 
      partner: { ...partner, _id: result.insertedId } 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ error: 'Failed to create partner' }, { status: 500 });
  }
}

// PUT - Update partner
export async function PUT(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('partners');

    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
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
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Partner updated successfully' });
  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json({ error: 'Failed to update partner' }, { status: 500 });
  }
}

// DELETE - Delete partner
export async function DELETE(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db('bayanmed');
    const collection = db.collection('partners');

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Partner ID is required' }, { status: 400 });
    }

    const result = await collection.deleteOne({ id: parseInt(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ error: 'Failed to delete partner' }, { status: 500 });
  }
}
