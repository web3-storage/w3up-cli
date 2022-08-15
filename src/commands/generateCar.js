import * as CAR from "@ucanto/transport/car";
import * as CBOR from "@ucanto/transport/cbor";
import { v4 as uuid } from "uuid";
import fs from "fs";
import path from "path";

export const generateCar = async (path) => {
  const targetPath = path.resolve(process.cwd(), path);

  const data = {};

  const carData = {
    roots: [
      await CBOR.codec.write({ data, id: uuid(), type: "upload-session" }),
    ],
  };
  const car = await CAR.codec.write(carData);

  console.log(car);

  return car;
};

export const writeFileLocally = async (car) => {
  await fs.writeFileSync(car, "foo");
};
