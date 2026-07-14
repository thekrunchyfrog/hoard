export default function DyTable({ headers, items }) {
  console.log(headers);
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-dark">
          <tr>
            {headers.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.fashion_name}</td>
              <td>{item.description || "N/A"}</td>
              <td>{item.category || "N/A"}</td>
              <td>{item.year || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
