import React, { useState } from "react";
import data, { Ingredient } from "../data/data";
import { deburr, find, pullAt, round, sumBy, toNumber } from "lodash";
import { FaTrash, FaPlus } from "react-icons/fa";

const ruleOfThree = (
  weightA: number,
  weightB: number,
  measureB: number
): number => {
  return (weightA * measureB) / weightB;
};

const IngredientsTable = (): JSX.Element => {
  const [autoComplete, setAutoComplete] = useState<{
    index: number;
    options: Ingredient[];
  }>({
    index: -1,
    options: [],
  });

  const emptyIngredient: Ingredient = {
    id: -1,
    carbs: 0,
    kcal: 0,
    lipids: 0,
    name: "",
    weight: 0,
    protein: 0,
  };

  const [selectedIngredients, setSelectedIngredients] = useState([
    emptyIngredient,
  ]);

  const [excelCopy, setExcelCopy] = useState<boolean>(false);

  const handleExcelCopy = async () => {
    let ingredientsAsCsv = "";

    for (const ing of selectedIngredients) {
      const { name, weight, protein, carbs, lipids, kcal } = ing;
      ingredientsAsCsv +=
        [name, weight, protein, carbs, lipids, kcal].join("\t") + "\n";
    }

    navigator.clipboard.writeText(ingredientsAsCsv);

    setExcelCopy(true);

    await new Promise((res, _) => {
      setTimeout(res, 1 * 1000);
    });

    setExcelCopy(false);
  };

  const handleNameChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = deburr(e.target.value);

    const filteredOptions =
      value.trim().length === 0
        ? []
        : data.filter((i) => {
            const name = deburr(i.name);
            return name
              .toLocaleLowerCase()
              .startsWith(value.toLocaleLowerCase());
          });

    console.log(filteredOptions);

    const newSelectedIngredients = selectedIngredients.map((ing, i) => {
      if (i === index) {
        return {
          ...ing,
          name: e.target.value,
        };
      }
      return ing;
    });

    setSelectedIngredients(newSelectedIngredients);
    setAutoComplete({
      index,
      options: filteredOptions,
    });
  };

  const handleWeightChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSelectedIngredients = selectedIngredients.map((ing, i) => {
      if (i === index) {
        const weight = toNumber(e.target.value);

        const baseIng = find(data, (ingredient: Ingredient) => {
          return ingredient.id === ing.id;
        });

        if (!baseIng) {
          return {
            ...ing,
            weight: weight,
          };
        } else {
          const carbs = ruleOfThree(weight, baseIng.weight, baseIng.carbs);
          const protein = ruleOfThree(weight, baseIng.weight, baseIng.protein);
          const lipids = ruleOfThree(weight, baseIng.weight, baseIng.lipids);
          const kcal = ruleOfThree(weight, baseIng.weight, baseIng.kcal);

          return {
            ...ing,
            carbs,
            protein,
            lipids,
            kcal,
            weight,
          };
        }
      }

      return ing;
    });

    setSelectedIngredients(newSelectedIngredients);
  };

  const handleAutoCompleteSelect = (option: Ingredient, index: number) => {
    const newSelectedIngredients = selectedIngredients.map((ing, i) => {
      if (i === index) {
        return option;
      }

      return ing;
    });

    setSelectedIngredients(newSelectedIngredients);
    setAutoComplete({ index: 0, options: [] });
  };

  const addIngredient = () => {
    setSelectedIngredients([...selectedIngredients, emptyIngredient]);
  };

  const removeIngredient = (index: number) => {
    const copyOfIngredients = Object.create(selectedIngredients);

    pullAt(copyOfIngredients, [index]);

    setSelectedIngredients(copyOfIngredients);
  };

  return (
    <div className="grid grid-cols-8 gap-3 w-full">
      <div className="font-bold text-lg sm:text-sm text-center col-span-2 dark:text-white">
        Ing.
      </div>
      <div className="font-bold text-lg sm:text-sm text-center dark:text-white">
        Peso Neto
      </div>
      <div className="font-bold text-lg sm:text-sm text-center dark:text-white">
        Proteinas
      </div>
      <div className="font-bold text-lg sm:text-sm text-center dark:text-white">
        Carb.
      </div>
      <div className="font-bold text-lg sm:text-sm text-center dark:text-white">
        Lipidos
      </div>
      <div className="font-bold text-lg sm:text-sm text-center dark:text-white">
        Kcal
      </div>
      <div></div>

      {selectedIngredients.map((ing, i) => (
        <>
          <div className="col-span-2">
            <input
              className="w-full border-2 border-black dark:bg-black dark:text-white dark:border-white"
              type="text"
              value={ing.name}
              onChange={(e) => {
                handleNameChange(e, i);
              }}
            ></input>

            {autoComplete.index === i && autoComplete.options.length > 0 && (
              <div
                className="absolute max-h-40 overflow-auto border-2 border-black my-1 "
                onBlur={() => {
                  setAutoComplete({ index: -1, options: [] });
                }}
              >
                <div className="flex flex-col gap-1 z-50 bg-white dark:bg-black">
                  {autoComplete.options.map((o) => (
                    <div
                      className="text-sm hover:font-bold cursor-pointer dark:text-white"
                      key={o.id}
                      onClick={() => handleAutoCompleteSelect(o, i)}
                    >
                      {o.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <input
            className="border-2 border-black dark:bg-black dark:text-white dark:border-white"
            type="number"
            value={ing.weight}
            onChange={(e) => {
              handleWeightChange(e, i);
            }}
          ></input>

          <div className="text-center dark:text-white">
            {round(ing.protein, 2)}
          </div>
          <div className="text-center dark:text-white">
            {round(ing.carbs, 2)}
          </div>
          <div className="text-center dark:text-white">
            {round(ing.lipids, 2)}
          </div>
          <div className="text-center dark:text-white">
            {round(ing.kcal, 2)}
          </div>
          <div className="text-center dark:text-white">
            <FaTrash
              className="cursor-pointer hover:text-blue-700"
              onClick={() => {
                removeIngredient(i);
              }}
            />
          </div>
        </>
      ))}

      <div className="font-bold dark:text-white col-span-3 text-right">
        Total
      </div>
      <div className="font-bold dark:text-white  text-center">
        {round(
          sumBy(selectedIngredients, (si) => toNumber(si.protein)),
          2
        )}
      </div>
      <div className="font-bold dark:text-white  text-center">
        {round(
          sumBy(selectedIngredients, (si) => toNumber(si.carbs)),
          2
        )}
      </div>
      <div className="font-bold dark:text-white  text-center">
        {round(
          sumBy(selectedIngredients, (si) => toNumber(si.lipids)),
          2
        )}
      </div>
      <div className="font-bold dark:text-white  text-center">
        {round(
          sumBy(selectedIngredients, (si) => toNumber(si.kcal)),
          2
        )}
      </div>
      <div></div>

      <button
        className="col-span-8 flex justify-center gap-1 font-bold items-center bg-blue-500 text-white border rounded-xl py-[2px] hover:bg-blue-700 border-blue-500 hover:border-blue-700"
        onClick={addIngredient}
      >
        Agregar <FaPlus />
      </button>

      <div className="py-3"></div>

      <button
        onClick={handleExcelCopy}
        className="col-span-8 flex justify-center gap-1 font-bold items-center bg-green-500 text-white border rounded-xl py-[2px] hover:bg-green-700 border-green-500 hover:border-green-700"
      >
        {excelCopy ? "Copiado a excel!" : "Copiar a excel"}
      </button>
    </div>
  );
};

export default IngredientsTable;
