import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router";
import { DndContext, closestCenter, useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRole } from "../../hooks/useRole";
import type { apiTypes } from "@task-manager/data";
import { useApiClient } from "../../api/api";

// -------------------------------------------------------------------------------------------------
type Task = apiTypes.components["schemas"]["TaskResponseDto"];
type CreateTaskDto = apiTypes.components["schemas"]["CreateTaskDto"];
type CreateTaskFromData = Omit<CreateTaskDto, "orgId">;

type UpdateTaskDto = apiTypes.components["schemas"]["UpdateTaskDto"];
type CreateOrgResponseDto =
  apiTypes.components["schemas"]["CreateOrgResponseDto"];

// -------------------------------------------------------------------------------------------------
const columns = ["pending", "in_progress", "completed"] as const;

// -------------------------------------------------------------------------------------------------
const createSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
});

// -------------------------------------------------------------------------------------------------
const Tasks: React.FC = () => {
  // -----------------------------------------------------------------------------------------------
  // Retrieve `orgId` from URL (e.g. /orgs/:orgId/tasks)
  const { orgId } = useParams<{ orgId: string }>();
  // -----------------------------------------------------------------------------------------------
  // Use custom hook to get an api client (with token from auth store)
  const apiClient = useApiClient();
  // -----------------------------------------------------------------------------------------------
  // Get current user's role in the organization
  const role = useRole(orgId);
  // -----------------------------------------------------------------------------------------------
  // Get query client to invalidate queries
  const queryClient = useQueryClient();
  // -----------------------------------------------------------------------------------------------
  // Get organization details from API
  const { data: org } = useQuery<CreateOrgResponseDto>({
    queryKey: ["orgs", orgId],
    queryFn: async () => {
      const { data } = await apiClient.GET("/orgs/{orgId}", {
        params: { path: { orgId: orgId! } },
      });
      if (!data) {
        throw new Error("Organization not found");
      }

      return data;
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Get tasks for the organization from API
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["tasks", orgId],
    queryFn: async () => {
      const { data } = await apiClient.GET("/tasks", {
        params: { query: { orgId: orgId! } },
      });

      if (!data) return [];

      return data;
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Update task using API
  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      body,
    }: {
      id: string;
      body: Omit<UpdateTaskDto, "orgId">;
    }) => {
      const { data } = await apiClient.PUT("/tasks/{id}", {
        params: { path: { id } },
        body: {
          ...body,
          orgId: orgId!,
        },
      });

      return data;
    },
    // Runs before the mutationFn — lets us do an optimistic update
    onMutate: async ({ id, body }) => {
      // Cancel any outgoing fetches for tasks so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ["tasks", orgId] });

      // Save the current list of tasks in case we need to roll back on error
      const previous = queryClient.getQueryData<Task[]>(["tasks", orgId]);

      // Optimistically update the tasks in the cache so the UI updates immediately
      queryClient.setQueryData(["tasks", orgId], (old: Task[] = []) =>
        old.map((t) => (t.id === id ? { ...t, ...body } : t))
      );

      // Return context so we can roll back if something fails
      return { previous };
    },
    // If the request fails, roll back to the saved previous tasks
    onError: (err, variables, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(["tasks", orgId], context.previous);
      }
    },
    // Always invalidate query data to refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId] });
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Create task using API
  const createMutation = useMutation({
    mutationFn: async (body: CreateTaskFromData) => {
      const { data } = await apiClient.POST("/tasks", {
        body: {
          ...body,
          orgId: orgId!,
        },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId] });
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Delete task using API
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.DELETE("/tasks/{id}", {
        params: { path: { id }, query: { orgId: orgId! } },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", orgId] });
    },
  });

  // -----------------------------------------------------------------------------------------------
  // Hook Form
  const { register, handleSubmit } = useForm<CreateTaskFromData>({
    resolver: zodResolver(createSchema),
  });

  // Handle create task form submit
  const onCreate = (data: CreateTaskFromData) => {
    createMutation.mutate(data);
  };
  // -----------------------------------------------------------------------------------------------
  // For drag drop
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    // If user dropped outside of any droppable, do nothing
    if (!over) return;
    // If the drop target is the same as where it started, do nothing
    if (active.id === over.id) return;

    // Find the dragged task
    const task = tasks?.find((t) => t.id === active.id);
    if (!task) return;

    // Determine the new column:
    // 1. If the "over" droppable has `data.column`, use that.
    // 2. Otherwise, if we're over another task card, look up that card's column from tasks[].
    const newStatus =
      over?.data?.current?.column ??
      tasks?.find((t) => t.id === over.id)?.status;

    // If no status change, skip update
    if (!newStatus || newStatus === task.status) return;

    // Call mutation — optimistic update will immediately move the card in the UI
    updateMutation.mutate({ id: task.id, body: { status: newStatus } });
  };

  // -----------------------------------------------------------------------------------------------
  if (isLoading) return <div>Loading...</div>;
  // -----------------------------------------------------------------------------------------------
  // Group tasks by status
  const groupedTasks = columns.reduce((acc, col) => {
    acc[col] = tasks?.filter((t: Task) => t.status === col) || [];
    return acc;
  }, {} as Record<(typeof columns)[number], Task[]>);
  // -----------------------------------------------------------------------------------------------
  // -----------------------------------------------------------------------------------------------
  return (
    <div className="mx-auto">
      <div className="bg-base-100 rounded-box shadow-xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">
          Tasks for Organization:{" "}
          <span className="kbd">{org?.name || orgId}</span>
        </h1>

        {/* Create Task Form */}
        {role !== "viewer" && (
          <div className="bg-base-200 rounded-box p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
            <form
              onSubmit={handleSubmit(onCreate)}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="md:col-span-2">
                <input
                  {...register("title")}
                  placeholder="Task Title"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  {...register("assigneeId")}
                  placeholder="Assignee ID"
                  className="input input-bordered w-full"
                />
              </div>
              <div className="md:col-span-3">
                <input
                  {...register("description")}
                  placeholder="Description"
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    "Create"
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Drag and drop Tasks */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {columns.map((col) => (
              <Column
                key={col}
                id={col}
                tasks={groupedTasks[col]}
                role={role}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
const Column: React.FC<{
  id: string;
  tasks: Task[];
  role: string;
  onDelete: (id: string) => void;
}> = ({ id, tasks, role, onDelete }) => {
  // Make this column a "droppable" zone so that DnD-kit knows
  // it can be a target when an item is dragged.
  // We also store `column: id` in the droppable's `data` so we can
  // tell later which column an item was dropped into.
  const { setNodeRef } = useDroppable({ id, data: { column: id } });

  return (
    <div ref={setNodeRef} className="flex-1">
      <div className="bg-base-200 rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold text-center">
          {id.charAt(0).toUpperCase() + id.slice(1).replace("_", " ")}
          <span className="badge badge-neutral ml-2">{tasks.length}</span>
        </h2>
      </div>
      <div className="space-y-3 min-h-[100px]">
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              role={role}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
export const TaskCard: React.FC<{
  task: Task;
  role: string;
  onDelete: (id: string) => void;
}> = ({ task, role, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="card bg-base-100 shadow-md mb-3 transition-all duration-200 hover:shadow-lg"
    >
      <div className="card-body p-4">
        {/* Drag handle */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing select-none flex items-center gap-2 pb-2 border-b border-base-200"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="w-5 h-5 opacity-50"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 9h16M4 15h16"
            ></path>
          </svg>
          <h3 className="card-title text-lg m-0 flex-1">{task.title}</h3>
        </div>

        {task.description && (
          <p className="text-base-content/80 py-2">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          {task.assigneeId && (
            <div className="badge badge-outline gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="w-3 h-3"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              {task.assigneeId.substring(0, 8)}...
            </div>
          )}
          <div className="badge badge-ghost">
            {task.status.charAt(0).toUpperCase() +
              task.status.slice(1).replace("_", " ")}
          </div>
        </div>

        {(role === "owner" || role === "admin") && (
          <div className="card-actions justify-end mt-3 pt-3 border-t border-base-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="btn btn-error btn-xs"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
export default Tasks;
