"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n";
import type { Topic } from "@/lib/types";

type EditableQuestion = {
  key: string;
  text: string;
};

type EditableTopic = {
  key: string;
  title: string;
  questions: EditableQuestion[];
};

function groupTopics(topics: Topic[]): EditableTopic[] {
  const groups = new Map<string, EditableTopic>();
  for (const topic of topics) {
    const group = groups.get(topic.title) ?? {
      key: `topic-${topic.id}`,
      title: topic.title,
      questions: [],
    };
    group.questions.push({
      key: `question-${topic.id}`,
      text: topic.question,
    });
    groups.set(topic.title, group);
  }
  return Array.from(groups.values());
}

export function ManualTopicEditor({
  admin,
  locale,
  questionsLabel,
  topics,
  weekId,
}: {
  admin: boolean;
  locale: Locale;
  questionsLabel: string;
  topics: Topic[];
  weekId: number;
}) {
  const router = useRouter();
  const nextKey = useRef(1);
  const [editing, setEditing] = useState(false);
  const [groups, setGroups] = useState(() => groupTopics(topics));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const tr = locale === "tr";

  function key(prefix: string) {
    const value = `${prefix}-new-${nextKey.current}`;
    nextKey.current += 1;
    return value;
  }

  function beginEditing() {
    setGroups(groupTopics(topics));
    setMessage("");
    setEditing(true);
  }

  function updateTitle(groupKey: string, title: string) {
    setGroups((current) =>
      current.map((group) =>
        group.key === groupKey ? { ...group, title } : group,
      ),
    );
  }

  function updateQuestion(
    groupKey: string,
    questionKey: string,
    text: string,
  ) {
    setGroups((current) =>
      current.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              questions: group.questions.map((question) =>
                question.key === questionKey
                  ? { ...question, text }
                  : question,
              ),
            }
          : group,
      ),
    );
  }

  function addTopic() {
    setGroups((current) => [
      ...current,
      {
        key: key("topic"),
        title: "",
        questions: [{ key: key("question"), text: "" }],
      },
    ]);
  }

  function addQuestion(groupKey: string) {
    setGroups((current) =>
      current.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              questions: [
                ...group.questions,
                { key: key("question"), text: "" },
              ],
            }
          : group,
      ),
    );
  }

  function removeQuestion(groupKey: string, questionKey: string) {
    setGroups((current) =>
      current.map((group) =>
        group.key === groupKey
          ? {
              ...group,
              questions: group.questions.filter(
                (question) => question.key !== questionKey,
              ),
            }
          : group,
      ),
    );
  }

  async function save() {
    setMessage("");
    const normalizedGroups = groups.map((group) => ({
      ...group,
      title: group.title.trim(),
      questions: group.questions.map((question) => ({
        ...question,
        text: question.text.trim(),
      })),
    }));
    if (
      normalizedGroups.some(
        (group) =>
          !group.title ||
          group.questions.length === 0 ||
          group.questions.some((question) => !question.text),
      )
    ) {
      setMessage(
        tr
          ? "Her konu başlığı ve soru doldurulmalıdır. Boş bir konuyu kaldırmak için Konuyu sil düğmesini kullanın."
          : "Every topic and question is required. Use Delete topic to remove an empty topic.",
      );
      return;
    }

    setBusy(true);
    const response = await fetch(`/api/admin/weeks/${weekId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topics: normalizedGroups.flatMap((group) =>
          group.questions.map((question) => ({
            title: group.title,
            question: question.text,
          })),
        ),
      }),
    });
    const result = (await response.json()) as {
      message?: string;
      error?: string;
    };
    setBusy(false);
    setMessage(result.message ?? result.error ?? "");
    if (response.ok) {
      setGroups(normalizedGroups);
      setEditing(false);
      router.refresh();
    }
  }

  if (!editing) {
    return (
      <>
        {admin && (
          <div className="manual-topic-toolbar">
            <div>
              <strong>{tr ? "Manuel konu yönetimi" : "Manual topic management"}</strong>
              <small>
                {tr
                  ? "Konu başlıklarını ve soruları Excel kullanmadan düzenleyin."
                  : "Edit topic headings and questions without using Excel."}
              </small>
            </div>
            <button className="button button-primary" onClick={beginEditing} type="button">
              {tr ? "Konuları Düzenle" : "Edit Topics"}
            </button>
          </div>
        )}
        <TopicDisplay
          locale={locale}
          questionsLabel={questionsLabel}
          topics={topics}
        />
      </>
    );
  }

  return (
    <div className="manual-topic-editor">
      <div className="manual-topic-editor-heading">
        <div>
          <span className="eyebrow">{tr ? "Düzenleme modu" : "Editing mode"}</span>
          <h3>{tr ? `Hafta ${weekId} konuları` : `Week ${weekId} topics`}</h3>
          <p>
            {tr
              ? "Değişiklikler yalnızca Kaydet düğmesine bastığınızda yayımlanır."
              : "Changes are published only when you select Save."}
          </p>
        </div>
        <button className="button topic-add-button" onClick={addTopic} type="button">
          + {tr ? "Konu Ekle" : "Add Topic"}
        </button>
      </div>

      <div className="manual-topic-list">
        {groups.map((group, groupIndex) => (
          <section className="manual-topic-card" key={group.key}>
            <header>
              <span>{String(groupIndex + 1).padStart(2, "0")}</span>
              <label>
                {tr ? "Konu başlığı" : "Topic heading"}
                <input
                  onChange={(event) =>
                    updateTitle(group.key, event.target.value)
                  }
                  placeholder={tr ? "Örn. Arkadaşlık" : "e.g. Friendship"}
                  value={group.title}
                />
              </label>
              <button
                aria-label={tr ? "Konuyu sil" : "Delete topic"}
                className="topic-delete-button"
                onClick={() =>
                  setGroups((current) =>
                    current.filter((item) => item.key !== group.key),
                  )
                }
                type="button"
              >
                <TrashIcon />
                {tr ? "Konuyu Sil" : "Delete Topic"}
              </button>
            </header>
            <div className="manual-question-list">
              {group.questions.map((question, questionIndex) => (
                <div className="manual-question-row" key={question.key}>
                  <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                  <textarea
                    aria-label={`${tr ? "Soru" : "Question"} ${questionIndex + 1}`}
                    onChange={(event) =>
                      updateQuestion(group.key, question.key, event.target.value)
                    }
                    rows={2}
                    value={question.text}
                  />
                  <button
                    aria-label={tr ? "Soruyu sil" : "Delete question"}
                    disabled={group.questions.length === 1}
                    onClick={() =>
                      removeQuestion(group.key, question.key)
                    }
                    title={
                      group.questions.length === 1
                        ? tr
                          ? "Son soruyu kaldırmak için konuyu silin."
                          : "Delete the topic to remove its final question."
                        : undefined
                    }
                    type="button"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
              <button
                className="question-add-button"
                onClick={() => addQuestion(group.key)}
                type="button"
              >
                + {tr ? "Soru Ekle" : "Add Question"}
              </button>
            </div>
          </section>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="manual-topic-empty">
          <p>{tr ? "Bu haftada konu kalmadı." : "This week has no topics."}</p>
          <button onClick={addTopic} type="button">
            + {tr ? "İlk konuyu ekle" : "Add the first topic"}
          </button>
        </div>
      )}

      <div className="manual-topic-footer">
        <p role="status">{message}</p>
        <div>
          <button
            className="button button-export"
            disabled={busy}
            onClick={() => {
              setGroups(groupTopics(topics));
              setMessage("");
              setEditing(false);
            }}
            type="button"
          >
            {tr ? "İptal" : "Cancel"}
          </button>
          <button
            className="button button-primary"
            disabled={busy}
            onClick={() => void save()}
            type="button"
          >
            {busy
              ? tr ? "Kaydediliyor..." : "Saving..."
              : tr ? "Değişiklikleri Kaydet" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicDisplay({
  locale,
  questionsLabel,
  topics,
}: {
  locale: Locale;
  questionsLabel: string;
  topics: Topic[];
}) {
  const topicGroups = Array.from(
    topics.reduce((groups, topic) => {
      const group = groups.get(topic.title) ?? [];
      group.push(topic);
      groups.set(topic.title, group);
      return groups;
    }, new Map<string, Topic[]>()),
  );

  return (
    <div className="topic-groups">
      {topicGroups.map(([title, groupTopics], groupIndex) => (
        <section className="topic-group" key={title}>
          <header>
            <span>{String(groupIndex + 1).padStart(2, "0")}</span>
            <div>
              <small>{locale === "tr" ? "KONU BAŞLIĞI" : "TOPIC"}</small>
              <h3>{title}</h3>
            </div>
            <b>{groupTopics.length} {questionsLabel}</b>
          </header>
          <ol className="topic-list">
            {groupTopics.map((topic, questionIndex) => (
              <li key={topic.id}>
                <span>{String(questionIndex + 1).padStart(2, "0")}</span>
                <p>{topic.question}</p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
