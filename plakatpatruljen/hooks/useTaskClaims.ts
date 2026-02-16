import { useCallback, useEffect } from 'react';
import { useTaskStore } from '@/stores/taskStore';
import { getTaskClaims } from '@/lib/supabase/queries/tasks';
import type { TaskClaim } from '@/types/task';

export function useTaskClaims(workerId?: string) {
  const { tasks, isLoading, error, filters, setTasks, setLoading, setError, setFilters } =
    useTaskStore();

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    const result = await getTaskClaims({
      workerId,
      status: filters.status,
    });
    if (result.success) {
      setTasks(result.data.data as unknown as TaskClaim[]);
    } else {
      setError(result.error.message);
    }
  }, [workerId, filters.status, setTasks, setLoading, setError]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    isLoading,
    error,
    filters,
    setFilters,
    refetch: fetchTasks,
  };
}
