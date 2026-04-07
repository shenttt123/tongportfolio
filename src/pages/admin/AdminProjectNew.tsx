import { useNavigate } from "react-router-dom";
import {
  ProjectForm,
  emptyProjectFormState,
} from "../../components/admin/ProjectForm";

export function AdminProjectNew() {
  const navigate = useNavigate();

  return (
    <div>
      <h1 className="text-xl font-semibold text-white tracking-tight mb-8">New project</h1>
      <ProjectForm
        mode="create"
        initial={emptyProjectFormState}
        onSuccess={() => navigate("/admin/projects")}
        onCancel={() => navigate("/admin/projects")}
      />
    </div>
  );
}
