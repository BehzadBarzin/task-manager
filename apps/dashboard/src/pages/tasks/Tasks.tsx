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
    <div>
      <h1>Tasks for Organization: {org?.name || orgId}</h1>
      {/* If user is not a viewer, show create task form */}
      {role !== "viewer" && (
        <form onSubmit={handleSubmit(onCreate)}>
          <input {...register("title")} placeholder="Title" />
          <input {...register("description")} placeholder="Description" />
          <input {...register("assigneeId")} placeholder="Assignee ID" />
          <button type="submit">Create Task</button>
        </form>
      )}
      {/* Drag and drop Tasks */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex">
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
    <div ref={setNodeRef} className="w-1/3 p-2">
      <h2>{id.toUpperCase().replace("_", " ")}</h2>
      <SortableContext
        items={tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} role={role} onDelete={onDelete} />
        ))}
      </SortableContext>
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
      {...attributes} // keep attributes for accessibility
      className="p-2 border mb-2 flex flex-col gap-2"
    >
      {/* Drag handle — only this part starts dragging */}
      <div {...listeners} className="cursor-grab select-none bg-gray-100 p-1">
        <h3>{task.title}</h3>
      </div>

      <p>{task.description}</p>
      {task.assigneeId && <p>Assignee: {task.assigneeId}</p>}
      <p>Status: {task.status.toUpperCase().replace("_", " ")}</p>

      {(role === "owner" || role === "admin") && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="bg-red-500 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      )}
    </div>
  );
};

// -------------------------------------------------------------------------------------------------
export default Tasks;
