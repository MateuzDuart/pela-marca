import type User from "../modules/User";
import { Instance } from "./instance";

const base = "/api/v1"

export async function getUserdata(): Promise<User> {
  const res = (await Instance.get(base + "/user")).data

    return {
      name: res.name,
      email: res.email,
      picture: res.picture
    }

}

export async function updateUser(nome: string, picture: File | null): Promise<void> {
  const formData = new FormData();
  formData.append("name", nome);
  if (picture) {
    formData.append("image", picture);
  }

  await Instance.patch(base + "/user", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });
}