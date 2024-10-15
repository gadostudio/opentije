import { RouteRawData, ShapeRawData, StopRawData, TripRawData } from "../data/consumer";

const DB_VERSION = 1;
const DB_NAME = "opentije-data";

export async function openIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const openResponse = indexedDB.open(DB_NAME, DB_VERSION);

        openResponse.onerror = () => {
            reject(openResponse.error);
        };

        openResponse.onsuccess = () => {
            resolve(openResponse.result);
        };

        openResponse.onupgradeneeded = (event) => {
            const db = openResponse.result;
            if (event.oldVersion === 0) {
                db.createObjectStore("routes", { keyPath: "route_id" });
                db.createObjectStore("stops", { keyPath: "stop_id" });
                db.createObjectStore("shapes", { keyPath: "shape_id" });
                db.createObjectStore("trips", { keyPath: "trip_id" });
                // metadata only need key & value
                db.createObjectStore("meta", { keyPath: "key" });
            }
        };
    });
}

export async function getAll<T = unknown>(
    db: IDBDatabase,
    storeName: "routes" | "stops" | "shapes" | "trips" | "meta"
): Promise<T[]> {
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, "readonly");
        const store = tx.objectStore(storeName);
        const query = store.getAll();
        tx.commit();

        query.onsuccess = () => {
            const result = query.result as T[];
            resolve(result);
        }

        query.onerror = (event) => {
            reject(query.error);
        }
    });
}

export async function getGTFSCacheFromIDB(db: IDBDatabase) {
    const getRoutes = async (): Promise<RouteRawData[]> => {
        return await getAll<RouteRawData>(db, "routes");
    }

    const getStops = async (): Promise<StopRawData[]> => {
        return await getAll<StopRawData>(db, "stops");
    }

    const getShapes = async (): Promise<ShapeRawData[]> => {
        return await getAll<ShapeRawData>(db, "shapes");
    }

    const getTrips = async (): Promise<TripRawData[]> => {
        return await getAll<TripRawData>(db, "trips");
    }

    const resetMeta = async (): Promise<void> => {
        const tx = db.transaction("meta", "readwrite");
        const store = tx.objectStore("meta");
        store.clear();
        tx.commit();
    }

    const hydrateFromParsedGTFS = async (
        routeRawDatum: RouteRawData[],
        stopRawDatum: StopRawData[],
        shapeRawDatum: ShapeRawData[],
        tripRawDatum: TripRawData[]
    ): Promise<void> => {
        return new Promise((resolve, reject) => {
            const tx = db.transaction([
                "routes",
                "stops",
                "shapes",
                "trips",
                "meta"
            ], "readwrite");

            const routesStore = tx.objectStore("routes");
            for (const routeRawData of routeRawDatum) {
                try {
                    routesStore.put(routeRawData);
                } catch (e) {
                    // skip on invalid data
                    continue;
                }
            }

            const stopsStore = tx.objectStore("stops");
            for (const stopRawData of stopRawDatum) {
                try {
                    stopsStore.put(stopRawData);
                } catch (e) {
                    // skip on invalid data
                    continue;
                }
            }

            const shapesStore = tx.objectStore("shapes");
            for (const shapeRawData of shapeRawDatum) {
                try {
                    shapesStore.put(shapeRawData);
                } catch (e) {
                    // skip on invalid data
                    continue;
                }
            }

            const tripsStore = tx.objectStore("trips");
            for (const tripRawData of tripRawDatum) {
                try {
                    tripsStore.put(tripRawData);
                } catch (e) {
                    // skip on invalid data
                    continue;
                }
            }

            const metaStore = tx.objectStore("meta");
            metaStore.put({ key: "expireAt", value: new Date().getTime() });

            tx.commit();

            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error);
        });
    }

    return {
        getRoutes,
        getStops,
        getShapes,
        getTrips,
        hydrateFromParsedGTFS
    }
}
