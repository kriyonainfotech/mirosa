import React, { useMemo } from 'react';

// Reusable swatch component
const Swatch = ({ type, value, isSelected, onClick }) => {
    const materialColors = {
        "Yellow Gold": "#ceb583", // yellow-400
        "Rose Gold": "#e5bfba", // rose-400
        "White Gold": "#f1ebca", // gray-200
        "Silver": "#dbdbdb", // slate-300
        "Platinum": "#dedddb", // stone-200
    };

    if (type === 'material') {
        return (
            <button
                onClick={onClick}
                className={`w-8 h-8 rounded-full border-2 transition ${isSelected ? 'border-maroon' : 'border-gray-300 hover:border-gray-500'}`}
                title={value}
            >
                <div
                    className="w-full h-full rounded-full border-2 border-white"
                    style={{ backgroundColor: materialColors[value] || '#999999' }}
                />
            </button>
        );
    }

    if (type === 'size') {
        return (
            <button
                onClick={onClick}
                className={`w-10 h-10 rounded-full border text-sm flex items-center justify-center transition ${isSelected ? 'bg-maroon text-white border-maroon' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
            >
                {value}
            </button>
        );
    }

    // Can be extended for purity, etc.
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 border rounded-md text-sm transition ${isSelected ? 'bg-maroon text-white border-maroon' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
        >
            {value}
        </button>
    );
};

// Main selector component
const VariantSelector = ({ product, selectedOptions, onOptionChange }) => {

    // Memoize the calculation of available and variable attributes
    const variableAttributes = useMemo(() => {
        const attributes = {
            material: new Set(),
            purity: new Set(),
            size: new Set(),
            weight: new Set(),
        };

        product.variants.forEach(v => {
            if (v.material) attributes.material.add(v.material);
            if (v.purity) attributes.purity.add(v.purity);
            if (v.size) {
                if (Array.isArray(v.size)) {
                    // If it's an array, loop through it
                    v.size.forEach(s => attributes.size.add(s));
                } else {
                    // If it's a single string, just add that value
                    attributes.size.add(v.size);
                }
            }
            if (v.weight) attributes.weight.add(v.weight);
        });

        return {
            material: attributes.material.size > 1 ? [...attributes.material] : [],
            purity: attributes.purity.size > 1 ? [...attributes.purity] : [],
            size: attributes.size.size > 1 ? [...attributes.size] : [],
            weight: attributes.weight.size > 1 ? [...attributes.weight] : [],
        };
    }, [product.variants]);

    // Conditionally show size selector
    const shouldShowSizes = !['Bracelet', 'Necklace'].includes(product.category?.name) && variableAttributes.size.length > 0;

    return (
        <div className="space-y-6">
            {variableAttributes.material.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Metal Type: <span className="font-bold text-gray-900">{selectedOptions.material}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {variableAttributes.material.map(material => (
                            <Swatch
                                key={material}
                                type="material"
                                value={material}
                                isSelected={selectedOptions.material === material}
                                onClick={() => onOptionChange('material', material)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {shouldShowSizes && (
                <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Size: <span className="font-bold text-gray-900">{selectedOptions.size}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {variableAttributes.size.map(size => (
                            <Swatch
                                key={size}
                                type="size"
                                value={size}
                                isSelected={selectedOptions.size === size}
                                onClick={() => onOptionChange('size', size)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* You can add purity and weight here following the same pattern */}
            {variableAttributes.purity.length > 0 && (
                <div>
                    <h3 className="text-sm font-medium text-gray-600 mb-2">
                        Purity: <span className="font-bold text-gray-900">{selectedOptions.purity}</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {variableAttributes.purity.map(purity => (
                            <Swatch
                                key={purity}
                                type="purity"
                                value={purity}
                                isSelected={selectedOptions.purity === purity}
                                onClick={() => onOptionChange('purity', purity)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VariantSelector;