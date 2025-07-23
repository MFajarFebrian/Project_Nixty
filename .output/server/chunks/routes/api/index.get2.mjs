import { c as defineEventHandler, h as getQuery, f as db } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'chokidar';
import 'anymatch';
import 'node:crypto';
import 'node:url';
import 'mysql2/promise';
import 'pg';

const index_get = defineEventHandler(async (event) => {
  try {
    const query = getQuery(event);
    const {
      featured,
      limit = 10,
      offset = 0,
      status = "active"
    } = query;
    let sql = `
      SELECT 
        d.*,
        p.name as product_name,
        p.description as product_description,
        p.image_url as product_image,
        c.name as category_name,
        c.slug as category_slug
      FROM deals d
      LEFT JOIN products p ON d.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE d.status = ?
    `;
    const params = [status];
    if (featured === "true") {
      sql += " AND d.is_featured = 1";
    }
    sql += " AND (d.expires_at IS NULL OR d.expires_at > NOW())";
    sql += " ORDER BY d.is_featured DESC, d.created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await db.execute(sql, params);
    const deals = rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      oldPrice: row.old_price ? `Rp${Math.floor(row.old_price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : null,
      newPrice: `Rp${Math.floor(row.new_price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      price: `Rp${Math.floor(row.new_price).toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      // For compatibility
      discount: row.discount_percentage ? `${row.discount_percentage}% OFF` : null,
      badge: row.badge,
      backgroundImage: row.background_image_url,
      image: row.background_image_url,
      // For compatibility
      isFeatured: Boolean(row.is_featured),
      product: row.product_id ? {
        id: row.product_id,
        name: row.product_name,
        description: row.product_description,
        image: row.product_image,
        category: row.category_slug
      } : null,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));
    const featuredDeals = deals.filter((deal) => deal.isFeatured);
    const sideDeals = deals.filter((deal) => !deal.isFeatured);
    return {
      success: true,
      data: {
        all: deals,
        featured: featuredDeals,
        side: sideDeals
      },
      total: deals.length
    };
  } catch (error) {
    console.error("Error fetching deals:", error);
    return {
      success: false,
      message: "An error occurred while fetching deals",
      data: {
        all: [],
        featured: [],
        side: []
      }
    };
  }
});

export { index_get as default };
//# sourceMappingURL=index.get2.mjs.map
