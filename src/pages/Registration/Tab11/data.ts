import shortUUID from "short-uuid"
export interface TOBACCO_ALCOHOL_CONSUMPION {
    id: string,
    user_id: string,
    type: 'smoking_tobacco' | 'chewing_tobacco' | 'chewing_without_tobacco' | 'alcohol',
    product?: string,
    consumes?: number,
    from_age?: number,
    to_age?: number,
    number_per_day?: number,
    days_in_week?: number,
    duration_placement_hr?: number,
    duration_placement_min?: number,
    site_of_placement_L?: number, //0 or 1 
    site_of_placement_R?: number, //0 or 1 
    site_of_placement_F?: number, //0 or 1 
    site_of_placement_NA?: number, //0 or 1 
    without_tobacco?: number // 0 or 1 
    consumption_unit_per_day?: number // for alcohol
    is_other_product?: number // 0 or 1 
}




export interface initialState {
    product_type: 'smoking_tobacco' | 'chewing_tobacco' | 'chewing_without_tobacco' | 'alcohol';
    consumed: number,
    products: TOBACCO_ALCOHOL_CONSUMPION[]
}

export class TobaccoAlcoholConsumption {
    id: string = '';
    user_id: string = '';
    type: 'smoking_tobacco' | 'chewing_tobacco' | 'chewing_without_tobacco' | 'alcohol' = 'smoking_tobacco';
    product: string = '';
    consumes: number = 0;
    from_age: number = 0;
    to_age: number = 0;
    number_per_day: number = 0;
    days_in_week: number = 0;
    duration_placement_hr: number = 0;
    duration_placement_min: number = 0;
    site_of_placement_L: number = 0;
    site_of_placement_R: number = 0;
    site_of_placement_F: number = 0;
    site_of_placement_NA: number = 0;
    without_tobacco: number = 0;
    consumption_unit_per_day: number = 0;
    is_other_product: number = 0;

    constructor(init?: Partial<TobaccoAlcoholConsumption>) {
        Object.assign(this, { ...this, ...init });
    }
}

export const generateDefaultState = (user_id: string) => {
    const translator = shortUUID();
    const smokingProdArr = ["Manufactured Cigarette", "Bidi (Manufactured/Roll your own)"]
    const smokingProds = smokingProdArr.map(item => {
        return new TobaccoAlcoholConsumption({
            id: translator.generate(),
            product: item,
            type: 'smoking_tobacco'
        });
    })
    smokingProds.push(new TobaccoAlcoholConsumption({
        id: translator.generate(),
        product: '',
        type: 'smoking_tobacco',
        is_other_product: 1
    }))

    const chewingTobaccoArr = ['Tobacco Only', 'Tobacco with Lime(Khaini)', 'Betel quid (pan) with tobacco'];
    const chewingTobaccoProds = chewingTobaccoArr.map(item => {
        return new TobaccoAlcoholConsumption({
            id: translator.generate(),
            product: item,
            type: 'chewing_tobacco',
        })
    })
    chewingTobaccoProds.push(new TobaccoAlcoholConsumption({
        id: translator.generate(),
        product: '',
        type: 'smoking_tobacco',
        is_other_product: 1
    }))

    const chewing_without_tobaccoArr = ['Paan (betel leaf) without areca nut']
    const chewing_without_tobaccoProds = chewing_without_tobaccoArr.map(item => {
        return new TobaccoAlcoholConsumption({
            id: translator.generate(),
            product: '',
            type: 'chewing_without_tobacco',
        })
    })

    chewing_without_tobaccoProds.push(
        new TobaccoAlcoholConsumption({
            id: translator.generate(),
            product: '',
            type: 'chewing_without_tobacco',
            is_other_product: 1
        })
    )

    const alcoholArr = ['Beer', 'Whisky', 'Vodka', 'Rum', 'Wine', 'Breezer', 'North-east'];
    const alcoholProds = alcoholArr.map(item => {
        return new TobaccoAlcoholConsumption({
            id: translator.generate(),
            product: item,
            type: 'alcohol',
        })
    })
    alcoholProds.push(
        new TobaccoAlcoholConsumption({
            id: translator.generate(),
            product: '',
            type: 'alcohol',
            is_other_product: 1
        })
    )

    const initialState: initialState[] = [
        {
            product_type: 'smoking_tobacco',
            consumed: 0,
            products: smokingProds
        },
        {
            product_type: 'chewing_tobacco',
            consumed: 0,
            products: chewingTobaccoProds,
        },
        {
            product_type: 'chewing_without_tobacco',
            consumed: 0,
            products: chewing_without_tobaccoProds
        },
        {
            product_type: 'alcohol',
            consumed: 0,
            products: alcoholProds
        }
    ]
    return initialState;
}

export const populateWithBackend = (backendData: TOBACCO_ALCOHOL_CONSUMPION[], user_id: string | '') => {
    const translator = shortUUID();
    const defaultState = generateDefaultState(user_id);
    const normalize = (str?: string) => (str || '').trim().toLowerCase();
    // Group backend data by type
    const backendByType: Record<string, TOBACCO_ALCOHOL_CONSUMPION[]> = {};
    backendData.forEach(item => {
        if (!backendByType[item.type]) backendByType[item.type] = [];
        backendByType[item.type].push(item);
    });

    return defaultState.map(defaultGroup => {
        const type = defaultGroup.product_type;
        const backendProducts = backendByType[type] || [];

        const mergedProducts: TOBACCO_ALCOHOL_CONSUMPION[] = [];

        const defaultProducts = defaultGroup.products.filter(p => !p.is_other_product);
        const hasBackendOther = backendProducts.some(p => p.is_other_product === 1);

        if (backendProducts.length > 0) {
            // If backend has data for this type, merge it with defaults
            for (const defaultProduct of defaultProducts) {
                const match = backendProducts.find(
                    p => normalize(p.product) === normalize(defaultProduct.product) && !p.is_other_product
                );

                if (match) {
                    mergedProducts.push(match);
                } else {
                    mergedProducts.push(defaultProduct);
                }
            }

            // Handle other product
            if (hasBackendOther) {
                const other = backendProducts.find(p => p.is_other_product === 1);
                if (other) mergedProducts.push(other);
            } else {
                mergedProducts.push(new TobaccoAlcoholConsumption({
                    id: translator.generate(),
                    user_id,
                    type,
                    product: '',
                    is_other_product: 1,
                }));
            }
            return {
                product_type: type,
                consumed: 1, // ✅ Mark as consumed
                products: mergedProducts
            };

        } else {
            // No data from backend — use default products as-is (but still ensure 'Other' exists)
            const products = [...defaultProducts];

            // Add "Other" product
            products.push(new TobaccoAlcoholConsumption({
                id: translator.generate(),
                user_id,
                type,
                product: '',
                is_other_product: 1,
            }));

            return {
                product_type: type,
                consumed: 0, // ✅ Mark as NOT consumed
                products
            };
        }
    });

}