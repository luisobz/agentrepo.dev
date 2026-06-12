import { SkillForm } from '../../../../components/admin/skills/skill-form';

export default function NewSkillPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold">New skill</h1>
      <SkillForm />
    </div>
  );
}
