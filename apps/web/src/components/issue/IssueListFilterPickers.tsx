import type { IssueCandidatesTarget } from "@t3tools/client-runtime/state/issues";
import { CheckIcon, TagIcon, UserIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { useIssueFilterCandidates } from "~/state/issues";

import { PullRequestCandidatePicker } from "../pullRequest/PullRequestCandidatePicker";
import { pullRequestLabelColor } from "../pullRequest/pullRequestList.logic";

const matches = (needle: string, ...fields: ReadonlyArray<string | null | undefined>) =>
  needle.length === 0 || fields.some((field) => field?.toLowerCase().includes(needle));

/** Labels of every scope listed, read from the trackers when the picker opens. */
export function IssueLabelFilter(props: {
  scopes: ReadonlyArray<IssueCandidatesTarget>;
  value: ReadonlyArray<string>;
  onChange: (value: ReadonlyArray<string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const known = useIssueFilterCandidates(open ? props.scopes : []);
  const needle = query.trim().toLowerCase();
  const candidates = known.labels.filter((label) => matches(needle, label.name, label.description));
  const summary =
    props.value.length === 0
      ? "Labels"
      : props.value.length === 1
        ? props.value[0]
        : `${props.value.length} labels`;
  return (
    <PullRequestCandidatePicker
      icon={<TagIcon className="size-4" />}
      label="Filter by label"
      trigger={
        <Button variant="outline" aria-label={`Filter by label: ${summary}`}>
          <TagIcon aria-hidden className="size-4" />
          <span className="truncate">{summary}</span>
        </Button>
      }
      allowed
      disabledReason=""
      open={open}
      onOpenChange={setOpen}
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search labels"
      isPending={known.isPending && known.labels.length === 0}
      error={known.labels.length === 0 ? known.error : null}
      candidates={candidates}
      emptyLabel="These trackers have no labels."
      noMatchLabel="No label matches that."
      errorLabel="The labels could not be read."
      truncated={known.truncated}
      truncatedLabel="More labels exist than are listed here."
      candidateKey={(label) => label.name}
      onSelect={(label) =>
        props.onChange(
          props.value.includes(label.name)
            ? props.value.filter((name) => name !== label.name)
            : [...props.value, label.name].slice(0, 20),
        )
      }
    >
      {(label) => {
        const dot = pullRequestLabelColor(label.color);
        return (
          <>
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full bg-muted-foreground"
              {...(dot ? { style: { backgroundColor: dot } } : {})}
            />
            <span className="min-w-0 flex-1 truncate">{label.name}</span>
            {props.value.includes(label.name) ? (
              <CheckIcon aria-label="Selected" className="size-3.5 shrink-0" />
            ) : null}
          </>
        );
      }}
    </PullRequestCandidatePicker>
  );
}

/** One assignee; picking the selected person again clears the filter. */
export function IssueAssigneeFilter(props: {
  scopes: ReadonlyArray<IssueCandidatesTarget>;
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const known = useIssueFilterCandidates(open ? props.scopes : []);
  const needle = query.trim().toLowerCase();
  const candidates = known.assignees.filter((actor) => matches(needle, actor.login, actor.name));
  const summary = props.value ?? "Any assignee";
  return (
    <PullRequestCandidatePicker
      icon={<UserIcon className="size-4" />}
      label="Filter by assignee"
      trigger={
        <Button variant="outline" aria-label={`Filter by assignee: ${summary}`}>
          <UserIcon aria-hidden className="size-4" />
          <span className="truncate">{summary}</span>
        </Button>
      }
      allowed
      disabledReason=""
      open={open}
      onOpenChange={setOpen}
      query={query}
      onQueryChange={setQuery}
      searchLabel="Search people"
      isPending={known.isPending && known.assignees.length === 0}
      error={known.assignees.length === 0 ? known.error : null}
      candidates={candidates}
      emptyLabel="Nobody can be assigned on these trackers."
      noMatchLabel="Nobody matches that."
      errorLabel="The people could not be read."
      truncated={known.truncated}
      truncatedLabel="More people exist than are listed here."
      candidateKey={(actor) => actor.login}
      onSelect={(actor) => {
        props.onChange(actor.login === props.value ? undefined : actor.login);
        setOpen(false);
      }}
    >
      {(actor) => (
        <>
          <span className="min-w-0 flex-1 truncate">
            {actor.login}
            {actor.name ? <span className="text-muted-foreground"> · {actor.name}</span> : null}
          </span>
          {actor.login === props.value ? (
            <CheckIcon aria-label="Selected" className="size-3.5 shrink-0" />
          ) : null}
        </>
      )}
    </PullRequestCandidatePicker>
  );
}
