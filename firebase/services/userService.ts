import {DB_USER_COLLECTION_KEY} from "@/constants/constantData";
import {Role} from "@/constants/enums";
import {User} from "@/common/models";
import {collection, getDocs, query, where} from "@firebase/firestore";
import {db} from "@/firebase/db";
import {createE2EMockUser, isE2EMockModeEnabled} from "@/firebase/services/e2eMockData";

export const checkUserId = async (id: string): Promise<User | undefined> => {
    if (isE2EMockModeEnabled()) {
        return createE2EMockUser(id);
    }

    const consumptionDataRef = collection(db, `${DB_USER_COLLECTION_KEY}`);
    const queryUserKey = query(consumptionDataRef, where("key", "==", id));
    return getDocs(queryUserKey).then((result) => {
        if (result && !result.empty && result.docs[0]) {
            let role;
            if ((result.docs[0].get("role") as number) in Role) {
                role = (result.docs[0].get("role") as number) as Role;
            }
            const user: User = {
                key: result.docs[0].get("key"),
                name: result.docs[0].get("name"),
                role,
                defaultCar: result.docs[0].get("defaultCar")
            };
            return user;
        }
        return undefined;
    }).catch((error: Error) => {
        console.error(error.message);
        return undefined;
    });
};

