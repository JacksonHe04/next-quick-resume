import { ResumeManager } from "@/components/resumes/resume-manager";
import { getAppReadContext } from "@/modules/app/read-context";
import { listResumes } from "@/modules/resumes/repository";

export default async function ResumesPage() {
  const { database, userId } = await getAppReadContext();
  const resumes = await listResumes(database, userId);
  const editorHref = resumes[0]
    ? `/resumes/${resumes[0].id}`
    : undefined;

  return (
    <div className="mx-auto max-w-7xl px-5 py-7 lg:py-9">
      <ResumeManager
        initialResumes={resumes}
        editorHref={editorHref}
      />
    </div>
  );
}
