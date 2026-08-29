type DocTableRow = {
  _key?: string;
  cells?: string[];
};

type DocTableValue = {
  rows?: DocTableRow[];
};

export function DocTable({ value }: { value: DocTableValue }) {
  const rows = value?.rows ?? [];
  const columnCount = rows.reduce(
    (count, row) => Math.max(count, row.cells?.length ?? 0),
    0,
  );

  if (rows.length === 0 || columnCount === 0) return null;

  const header = rows[0]?.cells ?? [];
  const bodyRows = rows.slice(1);

  return (
    <div className="my-8 w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead className="bg-muted/60">
          <tr>
            {Array.from({ length: columnCount }, (_, columnIndex) => (
              <th
                key={columnIndex}
                scope="col"
                className="border-b border-border px-4 py-3 text-left font-semibold text-foreground"
              >
                {header[columnIndex] ?? ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr
              key={row._key ?? rowIndex}
              className="odd:bg-background even:bg-muted/20"
            >
              {Array.from({ length: columnCount }, (_, columnIndex) => (
                <td
                  key={columnIndex}
                  className="border-b border-border px-4 py-3 align-top text-muted-foreground last:border-b-0"
                >
                  {row.cells?.[columnIndex] ?? ''}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}