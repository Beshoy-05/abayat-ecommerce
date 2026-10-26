import { NextRequest, NextResponse } from 'next/server';
import { API_BASE_URL } from '@/api/client';

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const res = await fetch(`${API_BASE_URL}/api/Products/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { message: 'Product not found' },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Edit Product Endpoint
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get('authorization');
    const body = await request.json();

    const forwardHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (authHeader) {
      forwardHeaders['Authorization'] = authHeader;
    }

    const cleanId = Number(id);
    const res = await fetch(`${API_BASE_URL}/api/Products/${cleanId}`, {
      method: 'PUT',
      headers: forwardHeaders,
      body: JSON.stringify({ ...body, id: cleanId }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        errorJson = { message: errorText || 'Failed to update product on backend' };
      }
      return NextResponse.json(errorJson, { status: res.status });
    }

    let data = {
      success: true,
      message: 'Product updated successfully',
      id: cleanId,
    };
    try {
      const parsed = await res.json();
      data = { ...data, ...parsed };
    } catch {
      // 204 No Content has no body
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || 'Error updating product' },
      { status: 500 }
    );
  }
}
