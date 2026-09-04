import { useCallback, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";

import {
  createMeltColumnDefs,
  getMeltFields,
  getMeltRows,
} from "../helpers/meltGrid";
import MainContainer from "./MainContainer";

const { SubContainer } = MainContainer;

export const MeltGrid = ({
  brushIndexes,
  semestersDescending,
  tableMelt,
  xAxisSelection,
}) => {
  const gridRef = useRef();

  const fields = useMemo(
    () => getMeltFields(xAxisSelection, semestersDescending),
    [xAxisSelection, semestersDescending],
  );

  const rowData = useMemo(
    () => getMeltRows(tableMelt, fields, brushIndexes),
    [tableMelt, fields, brushIndexes],
  );

  const columnDefs = useMemo(
    () => createMeltColumnDefs(fields, rowData),
    [fields, rowData],
  );

  const exportCsv = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  return (
    <>
      <SubContainer className="d-flex flex-wrap gap-2">
        <button
          className="btn btn-success bg-gradient"
          onClick={exportCsv}
          type="button"
        >
          Download CSV export file
        </button>
      </SubContainer>
      <SubContainer>
        <div className="ag-theme-balham" style={{ height: 500 }}>
          <AgGridReact columnDefs={columnDefs} rowData={rowData} ref={gridRef} />
        </div>
      </SubContainer>
    </>
  );
};
