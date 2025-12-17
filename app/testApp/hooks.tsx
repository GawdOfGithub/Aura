import { useEffect, useState } from "react";
import { GroupData } from "./interfaces";
import { GroupInfoURL } from "./urlList";
// Replace with your actual backend URL

export const useGroupData = (userToken: string) => {
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (!userToken) return;
      console.log(userToken, "userTpken");
      try {
        console.log("Fetching group data...");
        const response = await fetch(GroupInfoURL(), {
          method: "GET",
          headers: {
            Authorization: `Token ${userToken}`, // Adjust based on your Auth type (Bearer/Token)
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Group Data Fetched:", data); // Requested Console Log
        setGroupData(data);
      } catch (err: any) {
        console.error("Failed to fetch group data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupData();
  }, [userToken]);

  return { groupData, loading, error };
};
