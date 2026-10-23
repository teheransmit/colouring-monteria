import fs from 'fs';
import path from 'path';

const STORE_PATH = path.join(__dirname, '..', '..', 'data', 'local_buildings_store.json');

interface BuildingRecord {
    attributes?: Record<string, any>;
    userAttributes?: Record<string, any>;
    revisionId?: string;
}

let cache: Record<string, BuildingRecord> = {};

function loadCache() {
    try {
        if (fs.existsSync(STORE_PATH)) {
            const raw = fs.readFileSync(STORE_PATH, 'utf-8');
            cache = JSON.parse(raw);
        }
    } catch (e) {
        cache = {};
    }
}
loadCache();

function persistCache() {
    try {
        const dir = path.dirname(STORE_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(STORE_PATH, JSON.stringify(cache, null, 2), 'utf-8');
    } catch (e) {
        console.error('Failed to persist dev building store:', e);
    }
}

export function getDevBuilding(buildingId: number) {
    const key = String(buildingId);
    const existing = cache[key] || {};
    return {
        building_id: buildingId,
        geometry_id: buildingId,
        revision_id: existing.revisionId || 'rev_dev_1',
        verified: {},
        uprns: [],
        planning_data: [],
        user_attributes: existing.userAttributes || {},
        ...(existing.attributes || {})
    };
}

export function saveDevBuilding(buildingId: number, attributes: any, userAttributes: any) {
    const key = String(buildingId);
    if (!cache[key]) {
        cache[key] = { attributes: {}, userAttributes: {} };
    }
    if (attributes) {
        cache[key].attributes = { ...cache[key].attributes, ...attributes };
    }
    if (userAttributes) {
        cache[key].userAttributes = { ...cache[key].userAttributes, ...userAttributes };
    }
    cache[key].revisionId = Date.now().toString();
    persistCache();

    return {
        attributes: cache[key].attributes,
        user_attributes: cache[key].userAttributes,
        revision_id: cache[key].revisionId
    };
}
