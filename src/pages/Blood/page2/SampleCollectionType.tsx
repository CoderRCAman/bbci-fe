import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { BLOOD_SAMPLE, BLOOD_SAMPLE_COLLECTION } from "./BloodPage2";
import { produce } from "immer";
import { FloatLabel } from "primereact/floatlabel";
export default function SampleCollectionType({
  data,
  addNewCollectionTube,
  removeCollectionTube,
  setBloodSample,
  isSampleCollected,
}: {
  data: BLOOD_SAMPLE_COLLECTION;
  addNewCollectionTube: any;
  removeCollectionTube: any;
  setBloodSample: React.Dispatch<React.SetStateAction<BLOOD_SAMPLE>>;
  isSampleCollected?: boolean;
}) {
  console.log(isSampleCollected);
  return (
    <div className="border rounded p-2 my-5 space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <p className="">Blood Collection Tube:</p>
        <Dropdown
          optionLabel="name"
          optionValue="value"
          value={data?.blood_collection_tube}
          className="border-1"
          placeholder="Select"
          style={{ width: "250px" }}
          disabled={!isSampleCollected}
          options={[
            { name: "EDTA", value: "EDTA" },
            { name: "SST", value: "SST" },
            { name: "SST-With Gel", value: "SST-With Gel" },
            { name: "Other", value: "Other" },
          ]}
          onChange={(e) =>
            setBloodSample((prev) =>
              produce(prev, (draft) => {
                const index = draft?.collection_tubes?.findIndex(
                  (item) => item.id === data.id
                );
                if (index === -1) return draft;
                console.log(e.value);
                draft.collection_tubes![index]!.blood_collection_tube = e.value;
              })
            )
          }
        />
      </div>
      <div>
        {
          data?.blood_collection_tube === 'Other' ?
            <div className="flex gap-5 items-center py-3">
              <p>Specify Other:</p>
              <FloatLabel>
                <InputText
                  keyfilter="int"
                  className="border-1 w-[300px] p-2"
                  value={data['blood_collection_tube_other']}
                  onChange={e => setBloodSample(prev =>
                    produce(prev, (draft) => {
                      const index = draft?.collection_tubes?.findIndex(
                        (item) => item.id === data.id
                      );
                      if (index === -1) return draft;
                      draft.collection_tubes![index]!.blood_collection_tube_other = e.target.value;
                    })
                  )}
                />
                <label>From Age</label>
              </FloatLabel>
            </div>
            : <></>
        }
      </div>

      <div className="flex gap-5 items-center">
        <p>Identific code of the Blood collection tube</p>
        <InputText
          className="border-1 p-2"
          value={data?.identification_code_tube}
          disabled={!isSampleCollected}
          onChange={(e) =>
            setBloodSample((prev) =>
              produce(prev, (draft) => {
                const index = draft?.collection_tubes?.findIndex(
                  (item) => item.id === data.id
                );
                if (index === -1) return;
                draft.collection_tubes![index]!.identification_code_tube =
                  e.target.value;
              })
            )
          }
        />
      </div>

      <div className="flex gap-5 items-center">
        <p>Volume (ml)</p>
        <InputText
          className="border-1 p-2"
          keyfilter={"int"}
          value={data?.volume?.toString()}
          disabled={!isSampleCollected}
          onChange={(e) =>
            setBloodSample((prev) =>
              produce(prev, (draft) => {
                const index = draft?.collection_tubes?.findIndex(
                  (item) => item.id === data.id
                );
                if (index === -1) return;
                draft.collection_tubes![index]!.volume = parseInt(
                  e.target.value
                );
              })
            )
          }
        />
      </div>

      <div className="flex gap-5 items-center">
        <p>Select sample characteristic*</p>
        <Dropdown
          optionLabel="name"
          optionValue="value"
          className="border-1"
          placeholder="Select"
          style={{ width: "250px" }}
          disabled={!isSampleCollected}
          options={[
            { name: "Normal-1111", value: "Normal-1111" },
            { name: "Hemolysed-2222", value: "Hemolysed-2222" },
            { name: "Lipemic-3333", value: "Lipemic-3333" },
            { name: "Ictric-4444", value: "Ictric-4444" },
            { name: "Clotted-5555", value: "Clotted-5555" },
          ]}
          value={data?.characteristic}
          onChange={(e) =>
            setBloodSample((prev) =>
              produce(prev, (draft) => {
                const index = draft?.collection_tubes?.findIndex(
                  (item) => item.id === data.id
                );
                if (index === -1) return;
                draft.collection_tubes![index]!.characteristic = e.target.value;
              })
            )
          }
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button
          onClick={addNewCollectionTube}
          label="Add more"
          className="px-10 py-2 rounded-full"
          severity="info"
        />
        <Button
          onClick={() => removeCollectionTube(data.id)}
          label="Remove"
          className="px-10 py-2 rounded-full"
          severity="danger"
        />
      </div>
    </div>
  );
}
