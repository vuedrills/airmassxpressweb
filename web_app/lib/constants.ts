export const EQUIPMENT_CATEGORIES = [
    "Roller Compactor",
    "Plate Compactor",
    "Compressor",
    "Motor Grader",
    "Water Bowser",
    "Horse and Trailor",
    "Rigid Truck",
    "Generator",
    "Deck pan",
    "Lowbed (all sizes)",
    "Excavator",
    "Bulldozer",
    "Concrete Mixer",
    "Forklift",
    "Loader",
    "TLB (Backhoe Loader)",
    "Tipper (Dump Truck)",
    "Tower Crane",
    "Mobile Crane",
    "Scaffolds"
];

// Fallback capacities for equipment types when API returns none.
// These are reasonable, production-safe defaults to keep the UI usable.
export const EQUIPMENT_CAPACITY_PRESETS: Record<string, { id: string; equipmentType: string; capacityCode: string; displayName: string; minWeightTons?: number; maxWeightTons?: number; sortOrder: number; }[]> = {
    "Excavator": [
        { id: "exc-05t", equipmentType: "Excavator", capacityCode: "5T", displayName: "5T Mini Excavator", minWeightTons: 4, maxWeightTons: 6, sortOrder: 1 },
        { id: "exc-12t", equipmentType: "Excavator", capacityCode: "12T", displayName: "12T Excavator", minWeightTons: 10, maxWeightTons: 14, sortOrder: 2 },
        { id: "exc-20t", equipmentType: "Excavator", capacityCode: "20T", displayName: "20T Excavator", minWeightTons: 18, maxWeightTons: 22, sortOrder: 3 },
        { id: "exc-30t", equipmentType: "Excavator", capacityCode: "30T", displayName: "30T Excavator", minWeightTons: 28, maxWeightTons: 32, sortOrder: 4 },
    ],
    "Bulldozer": [
        { id: "dozer-d3", equipmentType: "Bulldozer", capacityCode: "D3/D4", displayName: "Small Dozer (D3/D4)", sortOrder: 1 },
        { id: "dozer-d6", equipmentType: "Bulldozer", capacityCode: "D6/D7", displayName: "Mid Dozer (D6/D7)", sortOrder: 2 },
        { id: "dozer-d8", equipmentType: "Bulldozer", capacityCode: "D8+", displayName: "Heavy Dozer (D8+)", sortOrder: 3 },
    ],
    "Loader": [
        { id: "loader-1m3", equipmentType: "Loader", capacityCode: "1m3", displayName: "1m³ Bucket", sortOrder: 1 },
        { id: "loader-2m3", equipmentType: "Loader", capacityCode: "2m3", displayName: "2m³ Bucket", sortOrder: 2 },
        { id: "loader-3m3", equipmentType: "Loader", capacityCode: "3m3", displayName: "3m³ Bucket", sortOrder: 3 },
    ],
    "Mobile Crane": [
        { id: "crane-25t", equipmentType: "Mobile Crane", capacityCode: "25T", displayName: "25T City Crane", sortOrder: 1 },
        { id: "crane-50t", equipmentType: "Mobile Crane", capacityCode: "50T", displayName: "50T All Terrain", sortOrder: 2 },
        { id: "crane-80t", equipmentType: "Mobile Crane", capacityCode: "80T", displayName: "80T Heavy Lift", sortOrder: 3 },
    ],
    "Tower Crane": [
        { id: "tower-6t", equipmentType: "Tower Crane", capacityCode: "6T", displayName: "6T Tower Crane", sortOrder: 1 },
        { id: "tower-10t", equipmentType: "Tower Crane", capacityCode: "10T", displayName: "10T Tower Crane", sortOrder: 2 },
    ],
    "TLB (Backhoe Loader)": [
        { id: "tlb-standard", equipmentType: "TLB (Backhoe Loader)", capacityCode: "Std", displayName: "Standard TLB", sortOrder: 1 },
        { id: "tlb-4in1", equipmentType: "TLB (Backhoe Loader)", capacityCode: "4-in-1", displayName: "TLB with 4-in-1 Bucket", sortOrder: 2 },
    ],
    "Tipper (Dump Truck)": [
        { id: "tipper-6m3", equipmentType: "Tipper (Dump Truck)", capacityCode: "6m³", displayName: "6m³ Tipper", sortOrder: 1 },
        { id: "tipper-10m3", equipmentType: "Tipper (Dump Truck)", capacityCode: "10m³", displayName: "10m³ Tipper", sortOrder: 2 },
        { id: "tipper-15m3", equipmentType: "Tipper (Dump Truck)", capacityCode: "15m³", displayName: "15m³ Tipper", sortOrder: 3 },
    ],
    "Lowbed (all sizes)": [
        { id: "lowbed-10m", equipmentType: "Lowbed (all sizes)", capacityCode: "10m", displayName: "10m Lowbed", sortOrder: 1 },
        { id: "lowbed-13m", equipmentType: "Lowbed (all sizes)", capacityCode: "13m", displayName: "13m Lowbed", sortOrder: 2 },
        { id: "lowbed-18m", equipmentType: "Lowbed (all sizes)", capacityCode: "18m+", displayName: "18m+ Heavy Lowbed", sortOrder: 3 },
    ],
    "Roller Compactor": [
        { id: "roller-3t", equipmentType: "Roller Compactor", capacityCode: "3T", displayName: "3T Smooth Drum", sortOrder: 1 },
        { id: "roller-8t", equipmentType: "Roller Compactor", capacityCode: "8T", displayName: "8T Smooth/Vibe Drum", sortOrder: 2 },
        { id: "roller-12t", equipmentType: "Roller Compactor", capacityCode: "12T", displayName: "12T Padfoot", sortOrder: 3 },
    ],
    "Plate Compactor": [
        { id: "plate-70kg", equipmentType: "Plate Compactor", capacityCode: "70kg", displayName: "70kg Forward Plate", sortOrder: 1 },
        { id: "plate-120kg", equipmentType: "Plate Compactor", capacityCode: "120kg", displayName: "120kg Forward Plate", sortOrder: 2 },
        { id: "plate-200kg", equipmentType: "Plate Compactor", capacityCode: "200kg", displayName: "200kg Reversible Plate", sortOrder: 3 },
    ],
    "Water Bowser": [
        { id: "bowser-5000l", equipmentType: "Water Bowser", capacityCode: "5,000L", displayName: "5,000L Water Bowser", sortOrder: 1 },
        { id: "bowser-10000l", equipmentType: "Water Bowser", capacityCode: "10,000L", displayName: "10,000L Water Bowser", sortOrder: 2 },
        { id: "bowser-18000l", equipmentType: "Water Bowser", capacityCode: "18,000L", displayName: "18,000L Water Bowser", sortOrder: 3 },
    ],
    "Generator": [
        { id: "gen-5kva", equipmentType: "Generator", capacityCode: "5kVA", displayName: "5kVA Portable", sortOrder: 1 },
        { id: "gen-20kva", equipmentType: "Generator", capacityCode: "20kVA", displayName: "20kVA Site", sortOrder: 2 },
        { id: "gen-50kva", equipmentType: "Generator", capacityCode: "50kVA", displayName: "50kVA Industrial", sortOrder: 3 },
        { id: "gen-100kva", equipmentType: "Generator", capacityCode: "100kVA", displayName: "100kVA Industrial", sortOrder: 4 },
    ],
    "Compressor": [
        { id: "comp-175cfm", equipmentType: "Compressor", capacityCode: "175cfm", displayName: "175 cfm Towable", sortOrder: 1 },
        { id: "comp-250cfm", equipmentType: "Compressor", capacityCode: "250cfm", displayName: "250 cfm Towable", sortOrder: 2 },
        { id: "comp-400cfm", equipmentType: "Compressor", capacityCode: "400cfm", displayName: "400 cfm High Pressure", sortOrder: 3 },
    ],
    "Forklift": [
        { id: "fork-2t", equipmentType: "Forklift", capacityCode: "2T", displayName: "2T Forklift", sortOrder: 1 },
        { id: "fork-3t", equipmentType: "Forklift", capacityCode: "3T", displayName: "3T Forklift", sortOrder: 2 },
        { id: "fork-5t", equipmentType: "Forklift", capacityCode: "5T", displayName: "5T Forklift", sortOrder: 3 },
    ],
};
