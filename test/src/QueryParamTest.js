import React from "react";
import { useQueryParams } from '../../dist';

const getRandomString = () => {
  const r = Math.random() * 1235172132118424 + 12351241;
  return r.toString(32);
};

const QPTest = () => {
  const [params, setParams] = useQueryParams();

  const setSome = () => setParams({ some: getRandomString() });

  const setOthers = () => setParams({ others: getRandomString() });

  const unsetSome = () => setParams({ some: undefined });

  const unsetOthers = () => setParams({ others: undefined });

  return (
    <div>
      <div>{"Current Params: " + JSON.stringify(params, null, 2)}</div>

      <button onClick={setSome}>Set some</button>
      <button onClick={setOthers}>Set others</button>
      <br />
      <button onClick={unsetSome}>Unset some</button>
      <button onClick={unsetOthers}>Unset others</button>
    </div>
  );
};

export default QPTest;
