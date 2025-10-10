import { FAMILY_HISTORY_OF_CANCER_MASTER, FAMILY_HISTORY_OF_CANCER_RELATIVES } from "./Tab7";

export const relatives = [
    { name: "Father", value: 10 },
    { name: "Mother", value: 20 },

    // Brothers: 11–19
    { name: "Brother 1", value: 11 },
    { name: "Brother 2", value: 12 },
    { name: "Brother 3", value: 13 },
    { name: "Brother 4", value: 14 },
    { name: "Brother 5", value: 15 },
    { name: "Brother 6", value: 16 },
    { name: "Brother 7", value: 17 },
    { name: "Brother 8", value: 18 },
    { name: "Brother 9", value: 19 },

    // Sisters: 21–29
    { name: "Sister 1", value: 21 },
    { name: "Sister 2", value: 22 },
    { name: "Sister 3", value: 23 },
    { name: "Sister 4", value: 24 },
    { name: "Sister 5", value: 25 },
    { name: "Sister 6", value: 26 },
    { name: "Sister 7", value: 27 },
    { name: "Sister 8", value: 28 },
    { name: "Sister 9", value: 29 },

    // Sons: 31–39
    { name: "Son 1", value: 31 },
    { name: "Son 2", value: 32 },
    { name: "Son 3", value: 33 },
    { name: "Son 4", value: 34 },
    { name: "Son 5", value: 35 },
    { name: "Son 6", value: 36 },
    { name: "Son 7", value: 37 },
    { name: "Son 8", value: 38 },
    { name: "Son 9", value: 39 },

    // Daughters: 41–49
    { name: "Daughter 1", value: 41 },
    { name: "Daughter 2", value: 42 },
    { name: "Daughter 3", value: 43 },
    { name: "Daughter 4", value: 44 },
    { name: "Daughter 5", value: 45 },
    { name: "Daughter 6", value: 46 },
    { name: "Daughter 7", value: 47 },
    { name: "Daughter 8", value: 48 },
    { name: "Daughter 9", value: 49 },
];

export function hasMasterData(data: FAMILY_HISTORY_OF_CANCER_MASTER): boolean {
    return !!(
        data.brothers !== 0 ||
        data.sisters !== 0 ||
        data.sons !== 0 ||
        data.daughters !== 0 ||
        data.history_of_cancer !== 0
    );''
}

export function hasRelativeData(data: FAMILY_HISTORY_OF_CANCER_RELATIVES): boolean {
    return !!(
        data.relation.trim() !== '' ||
        data.code !== 0 ||
        data.age_at_diagnosis !== 0 ||
        data.cancer_site.trim() !== '' ||
        data.treatment_received !== 0
    );
}