import { useEffect } from "react";
import { fetchGroupData } from "../store/features/groups/groupSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
// Replace with your actual backend URL

export const useGroupData = () => {
  const dispatch = useAppDispatch();
  const {
    data: groupData,
    loading,
    error,
  } = useAppSelector((state) => state.group);

  useEffect(() => {
    if (!groupData) {
      dispatch(fetchGroupData());
    }
  }, [dispatch, groupData]);

  return { groupData, loading, error };
};
