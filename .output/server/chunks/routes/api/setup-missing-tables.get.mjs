import { c as defineEventHandler, f as db } from '../../_/nitro.mjs';
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

const setupMissingTables_get = defineEventHandler(async (event) => {
  try {
    console.log("Setting up missing tables...");
    const result = {
      success: true,
      created: [],
      errors: []
    };
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS nixty.announcements (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          content TEXT,
          image_url VARCHAR,
          is_new BOOLEAN DEFAULT true,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      result.created.push("announcements");
      console.log("\u2713 Created announcements table");
    } catch (error) {
      result.errors.push(`Announcements table error: ${error.message}`);
      console.error("\u2717 Announcements table error:", error);
    }
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS nixty.hero_slides (
          id SERIAL PRIMARY KEY,
          title VARCHAR NOT NULL,
          description TEXT,
          background_image_url VARCHAR,
          product_id INTEGER REFERENCES nixty.products(id) ON DELETE SET NULL,
          is_new BOOLEAN DEFAULT false,
          status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          sort_order SMALLINT DEFAULT 0,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        )
      `);
      result.created.push("hero_slides");
      console.log("\u2713 Created hero_slides table");
    } catch (error) {
      result.errors.push(`Hero slides table error: ${error.message}`);
      console.error("\u2717 Hero slides table error:", error);
    }
    try {
      await db.query(`
        INSERT INTO nixty.announcements (title, content, image_url, is_new, status) VALUES
          ('Welcome to Nixty', 'Discover amazing software deals and licensing solutions', '/announcement.jfif', true, 'active'),
          ('New Office 365 Plans Available', 'Check out our latest Office 365 offerings with competitive pricing', '/announcement.jfif', true, 'active'),
          ('Security Update', 'Enhanced security features now available for all products', '/announcement.jfif', false, 'active')
        ON CONFLICT DO NOTHING
      `);
      console.log("\u2713 Inserted sample announcements");
    } catch (error) {
      result.errors.push(`Insert announcements error: ${error.message}`);
      console.error("\u2717 Insert announcements error:", error);
    }
    try {
      await db.query(`
        INSERT INTO nixty.hero_slides (title, description, background_image_url, is_new, status, sort_order) VALUES
          ('Office 365 Personal', 'Get the most out of Office with a Microsoft 365 subscription', '/office365-hero.svg', false, 'active', 1),
          ('Windows 11 Pro', 'The most secure Windows ever built', '/hero-background.jfif', false, 'active', 2),
          ('Business Solutions', 'Complete business productivity and security solutions', '/hero-background.jfif', true, 'active', 3)
        ON CONFLICT DO NOTHING
      `);
      console.log("\u2713 Inserted sample hero slides");
    } catch (error) {
      result.errors.push(`Insert hero slides error: ${error.message}`);
      console.error("\u2717 Insert hero slides error:", error);
    }
    if (result.errors.length > 0) {
      result.success = false;
    }
    return result;
  } catch (error) {
    console.error("Setup missing tables error:", error);
    return {
      success: false,
      message: "Failed to setup missing tables",
      error: error.message
    };
  }
});

export { setupMissingTables_get as default };
//# sourceMappingURL=setup-missing-tables.get.mjs.map
