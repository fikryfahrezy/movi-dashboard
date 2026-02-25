import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import styles from "./styles.module.css";

export type MovieFormValues = {
  title: string;
  genre: string;
  release_date: string;
  overview: string;
  vote_average: string;
};

type MovieFormProps = {
  defaultValues?: Partial<MovieFormValues>;
  onSubmit: (values: MovieFormValues) => void;
  isPending: boolean;
  onCancel: () => void;
};

export function MovieForm({
  defaultValues = {},
  onSubmit,
  isPending,
  onCancel,
}: MovieFormProps) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSubmit({
      title: (fd.get("title") as string) ?? "",
      genre: (fd.get("genre") as string) ?? "",
      release_date: (fd.get("release_date") as string) ?? "",
      overview: (fd.get("overview") as string) ?? "",
      vote_average: (fd.get("vote_average") as string) ?? "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <Input
        label="Title"
        name="title"
        required
        defaultValue={defaultValues.title ?? ""}
      />
      <Input
        label="Genre"
        name="genre"
        required
        defaultValue={defaultValues.genre ?? ""}
      />
      <Input
        label="Release Date"
        name="release_date"
        type="date"
        defaultValue={defaultValues.release_date ?? ""}
      />
      <Input
        label="Overview"
        name="overview"
        defaultValue={defaultValues.overview ?? ""}
      />
      <Input
        label="Vote Average"
        name="vote_average"
        type="number"
        min="0"
        max="10"
        step="0.1"
        defaultValue={defaultValues.vote_average ?? ""}
      />
      <div className={styles.formActions}>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
