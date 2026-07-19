import skipper_fashion_mappings from "../config/skipper_fashion.json";

export function DyTable({ items, selectedCollection }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {skipper_fashion_mappings.map((mapping) => (
              <th
                key={mapping.field_name}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {mapping.header_name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {items.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {skipper_fashion_mappings.map((mapping) => {
                const value = item[mapping.field_name];
                let cellValue = value ?? "N/A";
                // Only convert to checkmark if field_name starts with "is_"
                if (mapping.field_name.startsWith("is_") && value === 1) {
                  cellValue = "✓";
                } else if (
                  mapping.field_name.startsWith("is_") &&
                  value === 0
                ) {
                  cellValue = "○";
                }
                return (
                  <td
                    key={mapping.field_name}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300"
                  >
                    {cellValue}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
