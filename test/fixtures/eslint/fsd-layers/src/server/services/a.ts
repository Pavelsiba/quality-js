import { client } from "@/server/clients/c"
import { data } from "@/server/data/d"
import { db } from "@/server/db/x" // ловит

export const service = client + data + db
