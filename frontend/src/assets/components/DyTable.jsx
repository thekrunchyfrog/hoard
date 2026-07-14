import skipper_fashion_mappings from "../config/skipper_fashion.json";

export default function DyTable({ items, selectedCollection }) {
  console.log(skipper_fashion_mappings);
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            {skipper_fashion_mappings.map((mapping) => (
              <th key={mapping.field_name}>{mapping.header_name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {skipper_fashion_mappings.map((mapping) => {
                const value = item[mapping.field_name];
                let cellValue = value ?? "N/A";
                // Only convert to checkmark if field_name starts with "is_"
                if (mapping.field_name.startsWith("is_") && value === 1) {
                  cellValue = "✓";
                } else if (mapping.field_name.startsWith("is_") && value === 0) {
                  cellValue = "○";
                }
                return <td key={mapping.field_name}>{cellValue}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
