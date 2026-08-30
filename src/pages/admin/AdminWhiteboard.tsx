import { useState, useMemo, useEffect } from "react";
import { AdminShell, Card, StatCard, Badge, SearchBar, Modal, Field, Select, Empty } from "./AdminShell";
import {
  getStoredSamples, saveStoredSamples, resetSamplesToDefault,
  getStoredResources, saveStoredResources, resetResourcesToDefault,
  getStoredLessons, saveStoredLessons, resetLessonsToDefault,
  type HubSampleTemplate, type HubResourceCard, type HubLessonItem, type WhiteboardShape
} from "../../lib/whiteboardHubData";
import { navigate } from "../../lib/router";
import {
  Presentation, LayoutTemplate, BookOpen, Library, Plus, Pencil, Trash2,
  RotateCcw, Sparkles, ExternalLink, Check, Copy, AlertTriangle, Layers,
  FileSpreadsheet, ShieldAlert, SlidersHorizontal
} from "lucide-react";

export function AdminWhiteboard() {
  const [activeTab, setActiveTab] = useState<"samples" | "resources" | "lessons">("samples");
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // State collections
  const [samples, setSamples] = useState<HubSampleTemplate[]>(() => getStoredSamples());
  const [resources, setResources] = useState<HubResourceCard[]>(() => getStoredResources());
  const [lessons, setLessons] = useState<HubLessonItem[]>(() => getStoredLessons());

  // Listen to cross-window / tab changes
  useEffect(() => {
    const handleUpdate = () => {
      setSamples(getStoredSamples());
      setResources(getStoredResources());
      setLessons(getStoredLessons());
    };
    window.addEventListener("gamat_whiteboard_data_updated", handleUpdate);
    return () => window.removeEventListener("gamat_whiteboard_data_updated", handleUpdate);
  }, []);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  /* ------------------- SAMPLE / TEMPLATE MODAL STATE ------------------- */
  const [sampleModalOpen, setSampleModalOpen] = useState(false);
  const [editingSample, setEditingSample] = useState<HubSampleTemplate | null>(null);
  const [sampleForm, setSampleForm] = useState<{
    name: string;
    category: string;
    tag: string;
    difficulty: "Beginner" | "Intermediate" | "Advanced";
    desc: string;
    shapesJson: string;
  }>({
    name: "",
    category: "Smart Money Concepts",
    tag: "Institutional Setup",
    difficulty: "Beginner",
    desc: "",
    shapesJson: "[]",
  });

  const openAddSampleModal = () => {
    setEditingSample(null);
    setSampleForm({
      name: "",
      category: "Smart Money Concepts",
      tag: "Institutional Setup",
      difficulty: "Beginner",
      desc: "",
      shapesJson: JSON.stringify([
        {
          id: `shape_${Date.now()}_1`,
          type: "orderblock",
          color: "#8b5cf6",
          strokeWidth: 2,
          points: [{ x: 120, y: 150 }, { x: 450, y: 220 }],
          text: "H4 Demand Zone",
        },
        {
          id: `shape_${Date.now()}_2`,
          type: "long",
          color: "#10b981",
          strokeWidth: 2,
          points: [{ x: 300, y: 220 }, { x: 500, y: 100 }],
          text: "1:3.5 R:R Long Entry",
        },
      ], null, 2),
    });
    setSampleModalOpen(true);
  };

  const openEditSampleModal = (sample: HubSampleTemplate) => {
    setEditingSample(sample);
    setSampleForm({
      name: sample.name,
      category: sample.category,
      tag: sample.tag,
      difficulty: sample.difficulty,
      desc: sample.desc,
      shapesJson: JSON.stringify(sample.shapes, null, 2),
    });
    setSampleModalOpen(true);
  };

  const handleSaveSample = () => {
    if (!sampleForm.name.trim()) {
      alert("Please enter a template name.");
      return;
    }

    let parsedShapes: WhiteboardShape[] = [];
    try {
      parsedShapes = JSON.parse(sampleForm.shapesJson || "[]");
      if (!Array.isArray(parsedShapes)) parsedShapes = [];
    } catch {
      alert("Invalid JSON format in shapes configuration. Please check the JSON syntax.");
      return;
    }

    if (editingSample) {
      // Update existing sample
      const updated = samples.map((s) =>
        s.id === editingSample.id
          ? {
              ...s,
              name: sampleForm.name.trim(),
              category: sampleForm.category.trim(),
              tag: sampleForm.tag.trim(),
              difficulty: sampleForm.difficulty,
              desc: sampleForm.desc.trim(),
              shapesCount: parsedShapes.length,
              shapes: parsedShapes,
            }
          : s
      );
      setSamples(updated);
      saveStoredSamples(updated);
      showToast(`Updated template "${sampleForm.name}" successfully!`);
    } else {
      // Add new sample
      const newSample: HubSampleTemplate = {
        id: `sample_${Date.now()}`,
        name: sampleForm.name.trim(),
        category: sampleForm.category.trim(),
        tag: sampleForm.tag.trim(),
        difficulty: sampleForm.difficulty,
        desc: sampleForm.desc.trim(),
        shapesCount: parsedShapes.length,
        shapes: parsedShapes,
      };
      const updated = [newSample, ...samples];
      setSamples(updated);
      saveStoredSamples(updated);
      showToast(`Added new template "${sampleForm.name}" successfully!`);
    }

    setSampleModalOpen(false);
  };

  const handleDeleteSample = (sampleId: string) => {
    if (!confirm("Are you sure you want to delete this whiteboard template?")) return;
    const updated = samples.filter((s) => s.id !== sampleId);
    setSamples(updated);
    saveStoredSamples(updated);
    showToast("Template deleted successfully.");
  };

  /* ------------------- RESOURCE / GUIDE MODAL STATE ------------------- */
  const [resourceModalOpen, setResourceModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<HubResourceCard | null>(null);
  const [resourceForm, setResourceForm] = useState<{
    title: string;
    category: string;
    badge: string;
    badgeColor: string;
    desc: string;
    pointsText: string;
    actionLabel: string;
  }>({
    title: "",
    category: "Smart Money Concepts",
    badge: "Official Guide",
    badgeColor: "bg-purple-100 text-purple-700",
    desc: "",
    pointsText: "",
    actionLabel: "Create Canvas with Guide",
  });

  const openAddResourceModal = () => {
    setEditingResource(null);
    setResourceForm({
      title: "",
      category: "Smart Money Concepts",
      badge: "Official Guide",
      badgeColor: "bg-purple-100 text-purple-700",
      desc: "",
      pointsText: "• 50% Mean Threshold (MT) equilibrium mitigation rules\n• Valid vs invalid 3-candle Fair Value Gaps\n• Equal Highs (BSL) and Equal Lows (SSL) liquidity sweeps\n• Breaker block vs mitigation block identification",
      actionLabel: "Create Canvas with Guide",
    });
    setResourceModalOpen(true);
  };

  const openEditResourceModal = (res: HubResourceCard) => {
    setEditingResource(res);
    setResourceForm({
      title: res.title,
      category: res.category,
      badge: res.badge,
      badgeColor: res.badgeColor,
      desc: res.desc,
      pointsText: res.points.map((p) => `• ${p}`).join("\n"),
      actionLabel: res.actionLabel,
    });
    setResourceModalOpen(true);
  };

  const handleSaveResource = () => {
    if (!resourceForm.title.trim()) {
      alert("Please enter a resource title.");
      return;
    }

    const points = resourceForm.pointsText
      .split("\n")
      .map((l) => l.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);

    if (editingResource) {
      const updated = resources.map((r) =>
        r.id === editingResource.id
          ? {
              ...r,
              title: resourceForm.title.trim(),
              category: resourceForm.category.trim(),
              badge: resourceForm.badge.trim(),
              badgeColor: resourceForm.badgeColor.trim(),
              desc: resourceForm.desc.trim(),
              points,
              actionLabel: resourceForm.actionLabel.trim() || "Create Canvas with Guide",
            }
          : r
      );
      setResources(updated);
      saveStoredResources(updated);
      showToast(`Updated resource "${resourceForm.title}" successfully!`);
    } else {
      const newRes: HubResourceCard = {
        id: `res_${Date.now()}`,
        title: resourceForm.title.trim(),
        category: resourceForm.category.trim(),
        badge: resourceForm.badge.trim() || "Official Guide",
        badgeColor: resourceForm.badgeColor.trim() || "bg-purple-100 text-purple-700",
        desc: resourceForm.desc.trim(),
        points,
        actionLabel: resourceForm.actionLabel.trim() || "Create Canvas with Guide",
      };
      const updated = [newRes, ...resources];
      setResources(updated);
      saveStoredResources(updated);
      showToast(`Added new resource "${resourceForm.title}" successfully!`);
    }

    setResourceModalOpen(false);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!confirm("Are you sure you want to delete this resource & guide?")) return;
    const updated = resources.filter((r) => r.id !== resourceId);
    setResources(updated);
    saveStoredResources(updated);
    showToast("Resource guide deleted successfully.");
  };

  /* ------------------- PLAYBOOK LESSON MODAL STATE ------------------- */
  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<HubLessonItem | null>(null);
  const [lessonForm, setLessonForm] = useState<{
    num: string;
    title: string;
    subtitle: string;
    desc: string;
    itemsText: string;
  }>({
    num: "01",
    title: "",
    subtitle: "",
    desc: "",
    itemsText: "Order Blocks (OB) | Translucent Demand Zones\nFair Value Gaps (FVG) | 3-Candle Imbalances\nBreak of Structure (BOS) | Trend continuation lines",
  });

  const openAddLessonModal = () => {
    setEditingLesson(null);
    setLessonForm({
      num: String(lessons.length + 1).padStart(2, "0"),
      title: "",
      subtitle: "",
      desc: "",
      itemsText: "Feature 1 | Quick description or hotkey\nFeature 2 | Key execution rule\nFeature 3 | Pro checklist item",
    });
    setLessonModalOpen(true);
  };

  const openEditLessonModal = (lesson: HubLessonItem) => {
    setEditingLesson(lesson);
    setLessonForm({
      num: lesson.num,
      title: lesson.title,
      subtitle: lesson.subtitle,
      desc: lesson.desc,
      itemsText: lesson.items.map((i) => `${i.label} | ${i.value}`).join("\n"),
    });
    setLessonModalOpen(true);
  };

  const handleSaveLesson = () => {
    if (!lessonForm.title.trim()) {
      alert("Please enter a lesson title.");
      return;
    }

    const items = lessonForm.itemsText
      .split("\n")
      .map((line) => {
        const parts = line.split("|");
        return {
          label: (parts[0] || "").trim(),
          value: (parts[1] || "").trim(),
          isMono: false,
        };
      })
      .filter((i) => i.label || i.value);

    if (editingLesson) {
      const updated = lessons.map((l) =>
        l.id === editingLesson.id
          ? {
              ...l,
              num: lessonForm.num.trim() || "01",
              title: lessonForm.title.trim(),
              subtitle: lessonForm.subtitle.trim(),
              desc: lessonForm.desc.trim(),
              items,
            }
          : l
      );
      setLessons(updated);
      saveStoredLessons(updated);
      showToast(`Updated playbook guide "${lessonForm.title}" successfully!`);
    } else {
      const newLesson: HubLessonItem = {
        id: `lesson_${Date.now()}`,
        num: lessonForm.num.trim() || String(lessons.length + 1).padStart(2, "0"),
        title: lessonForm.title.trim(),
        subtitle: lessonForm.subtitle.trim(),
        desc: lessonForm.desc.trim(),
        colorClass: "bg-blue-50 text-blue-600",
        badgeBg: "bg-slate-50 border-line",
        badgeText: "text-slate-700",
        items,
      };
      const updated = [...lessons, newLesson];
      setLessons(updated);
      saveStoredLessons(updated);
      showToast(`Added new playbook guide "${lessonForm.title}" successfully!`);
    }

    setLessonModalOpen(false);
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!confirm("Are you sure you want to delete this playbook guide?")) return;
    const updated = lessons.filter((l) => l.id !== lessonId);
    setLessons(updated);
    saveStoredLessons(updated);
    showToast("Playbook guide deleted successfully.");
  };

  /* ------------------- FILTERED LISTS ------------------- */
  const filteredSamples = useMemo(() => {
    return samples.filter((s) => {
      const matchQ = `${s.name} ${s.category} ${s.tag} ${s.desc}`.toLowerCase().includes(q.toLowerCase());
      const matchCat = categoryFilter === "all" || s.category === categoryFilter;
      return matchQ && matchCat;
    });
  }, [samples, q, categoryFilter]);

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      const matchQ = `${r.title} ${r.category} ${r.desc} ${r.points.join(" ")}`.toLowerCase().includes(q.toLowerCase());
      const matchCat = categoryFilter === "all" || r.category === categoryFilter;
      return matchQ && matchCat;
    });
  }, [resources, q, categoryFilter]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchQ = `${l.title} ${l.subtitle} ${l.desc}`.toLowerCase().includes(q.toLowerCase());
      return matchQ;
    });
  }, [lessons, q]);

  // Categories list
  const allCategories = useMemo(() => {
    const set = new Set<string>();
    samples.forEach((s) => set.add(s.category));
    resources.forEach((r) => set.add(r.category));
    return Array.from(set);
  }, [samples, resources]);

  const totalShapes = useMemo(() => {
    return samples.reduce((acc, s) => acc + (s.shapes?.length || 0), 0);
  }, [samples]);

  return (
    <AdminShell
      title="Whiteboard Hub Manager"
      subtitle="Add, modify, and manage institutional templates, guides, resources, and playbook lessons shown on the whiteboard."
      action={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/whiteboard")}
            className="btn-outline-dark !py-2 !px-3 text-xs flex items-center gap-1.5"
          >
            <Presentation className="h-4 w-4 text-brand" /> Open Live Whiteboard <ExternalLink className="h-3 w-3" />
          </button>
        </div>
      }
    >
      {/* Toast Popup Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={LayoutTemplate} label="Active Templates" value={samples.length} />
        <StatCard icon={BookOpen} label="Resource Blueprints" value={resources.length} />
        <StatCard icon={Library} label="Playbook Guides" value={lessons.length} />
        <StatCard icon={Layers} label="Pre-Drawn Shapes" value={totalShapes} />
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-white border border-line shadow-2xs">
          <button
            type="button"
            onClick={() => { setActiveTab("samples"); setCategoryFilter("all"); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "samples"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-600 hover:text-ink hover:bg-slate-50"
            }`}
          >
            <LayoutTemplate className="h-4 w-4" />
            <span>Samples & Templates ({samples.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("resources"); setCategoryFilter("all"); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "resources"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-600 hover:text-ink hover:bg-slate-50"
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>Resources & Guides ({resources.length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("lessons"); setCategoryFilter("all"); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
              activeTab === "lessons"
                ? "bg-brand text-white shadow-sm"
                : "text-slate-600 hover:text-ink hover:bg-slate-50"
            }`}
          >
            <Library className="h-4 w-4" />
            <span>Playbook Lessons ({lessons.length})</span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          {activeTab === "samples" && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset all templates back to default institutional Forex setups?")) {
                    const res = resetSamplesToDefault();
                    setSamples(res);
                    showToast("Restored templates to system defaults.");
                  }
                }}
                className="px-3 py-2 rounded-xl border border-line bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                title="Reset to initial factory templates"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={openAddSampleModal}
                className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add New Template
              </button>
            </>
          )}

          {activeTab === "resources" && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset all resources back to default academy guides?")) {
                    const res = resetResourcesToDefault();
                    setResources(res);
                    showToast("Restored resources to system defaults.");
                  }
                }}
                className="px-3 py-2 rounded-xl border border-line bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={openAddResourceModal}
                className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add New Resource
              </button>
            </>
          )}

          {activeTab === "lessons" && (
            <>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Reset all playbook lessons back to default guides?")) {
                    const res = resetLessonsToDefault();
                    setLessons(res);
                    showToast("Restored lessons to system defaults.");
                  }
                }}
                className="px-3 py-2 rounded-xl border border-line bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </button>
              <button
                type="button"
                onClick={openAddLessonModal}
                className="btn-primary !py-2 !px-4 text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Playbook Lesson
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <Card className="mt-4 p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          <SearchBar
            value={q}
            onChange={setQ}
            placeholder={
              activeTab === "samples"
                ? "Search templates by name, tag, or description…"
                : activeTab === "resources"
                ? "Search resources and keypoints…"
                : "Search playbook lessons…"
            }
          />
          {activeTab !== "lessons" && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-xl border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink outline-none focus:border-brand"
            >
              <option value="all">All Categories</option>
              {allCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>
        <span className="text-xs text-muted font-bold">
          {activeTab === "samples"
            ? `${filteredSamples.length} template(s)`
            : activeTab === "resources"
            ? `${filteredResources.length} resource(s)`
            : `${filteredLessons.length} lesson(s)`}
        </span>
      </Card>

      {/* ======================= TAB 1: SAMPLES & TEMPLATES ======================= */}
      {activeTab === "samples" && (
        <div className="mt-6 space-y-4">
          {filteredSamples.length === 0 ? (
            <Empty
              icon={LayoutTemplate}
              title="No templates found"
              subtitle="No sample templates matched your search criteria. Click 'Add New Template' to create one."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="rounded-2xl border border-line bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-brand-light text-brand text-[10px] font-black uppercase tracking-wider">
                        {sample.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase ${
                          sample.difficulty === "Beginner"
                            ? "bg-emerald-100 text-emerald-800"
                            : sample.difficulty === "Intermediate"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {sample.difficulty}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-extrabold text-base text-ink group-hover:text-brand transition-colors">
                        {sample.name}
                      </h3>
                      <p className="text-xs text-muted font-bold mt-0.5">{sample.tag}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {sample.desc}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-line">
                      <span>{sample.shapes?.length || 0} Shape Layer(s)</span>
                      <span className="font-mono text-muted">ID: {sample.id}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditSampleModal(sample)}
                      className="px-3 py-1.5 rounded-xl border border-line bg-slate-50 hover:bg-white text-slate-700 hover:text-brand text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Template
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSample(sample.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Template"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: RESOURCES & GUIDES ======================= */}
      {activeTab === "resources" && (
        <div className="mt-6 space-y-4">
          {filteredResources.length === 0 ? (
            <Empty
              icon={BookOpen}
              title="No resources found"
              subtitle="No resource guides matched your search criteria. Click 'Add New Resource' to publish one."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {filteredResources.map((res) => (
                <div
                  key={res.id}
                  className="rounded-2xl border border-line bg-white p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-wider">
                        {res.category}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${res.badgeColor}`}>
                        {res.badge}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-base text-ink">{res.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{res.desc}</p>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-line space-y-1.5">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted">Key Learning Points</p>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {res.points.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-brand font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-between">
                    <span className="text-[11px] font-bold text-muted">Action: "{res.actionLabel}"</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditResourceModal(res)}
                        className="px-3 py-1.5 rounded-xl border border-line bg-slate-50 hover:bg-white text-slate-700 hover:text-brand text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" /> Edit Guide
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteResource(res.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Delete Resource"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 3: PLAYBOOK LESSONS ======================= */}
      {activeTab === "lessons" && (
        <div className="mt-6 space-y-4">
          {filteredLessons.length === 0 ? (
            <Empty
              icon={Library}
              title="No playbook guides found"
              subtitle="No playbook lessons matched your search query. Click 'Add Playbook Lesson' to add one."
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredLessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className="rounded-2xl border border-line bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-brand/10 text-brand font-mono font-black flex items-center justify-center text-sm shrink-0">
                        {lesson.num}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-sm text-ink truncate">{lesson.title}</h4>
                        <p className="text-[11px] text-muted font-bold truncate">{lesson.subtitle}</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {lesson.desc}
                    </p>

                    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-line">
                      <p className="text-[9px] font-black uppercase text-muted tracking-wider">Features & Hotkeys</p>
                      <div className="space-y-1 text-xs font-medium text-slate-700">
                        {lesson.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between gap-2">
                            <span className="truncate text-slate-600">{it.label}</span>
                            <span className="font-mono font-bold text-ink text-[11px] shrink-0">{it.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-line flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditLessonModal(lesson)}
                      className="px-3 py-1.5 rounded-xl border border-line bg-slate-50 hover:bg-white text-slate-700 hover:text-brand text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Edit Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLesson(lesson.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Delete Lesson"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================= MODAL: ADD / EDIT SAMPLE TEMPLATE ======================= */}
      {sampleModalOpen && (
        <Modal
          title={editingSample ? "Edit Whiteboard Template" : "Add New Whiteboard Template"}
          subtitle="Configure template meta information and pre-drawn candlestick/zone shapes."
          onClose={() => setSampleModalOpen(false)}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <Field label="Template Name">
              <input
                type="text"
                value={sampleForm.name}
                onChange={(e) => setSampleForm({ ...sampleForm, name: e.target.value })}
                placeholder="e.g. Asia High Liquidity Sweep & Judas Entry"
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <input
                  type="text"
                  value={sampleForm.category}
                  onChange={(e) => setSampleForm({ ...sampleForm, category: e.target.value })}
                  placeholder="e.g. Smart Money Concepts, Mind Maps, Risk..."
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                />
              </Field>

              <Field label="Difficulty Level">
                <select
                  value={sampleForm.difficulty}
                  onChange={(e) => setSampleForm({ ...sampleForm, difficulty: e.target.value as any })}
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </Field>
            </div>

            <Field label="Tag / Sub-Header">
              <input
                type="text"
                value={sampleForm.tag}
                onChange={(e) => setSampleForm({ ...sampleForm, tag: e.target.value })}
                placeholder="e.g. Order Blocks & FVG, H4 Liquidity Sweep..."
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
              />
            </Field>

            <Field label="Description">
              <textarea
                rows={3}
                value={sampleForm.desc}
                onChange={(e) => setSampleForm({ ...sampleForm, desc: e.target.value })}
                placeholder="Detailed explanation of the technical concept illustrated by this diagram template..."
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink outline-none focus:border-brand resize-none"
              />
            </Field>

            <Field label="Shapes Data (JSON Configuration)">
              <p className="text-[10px] text-muted mb-1.5">
                Array of canvas shapes (Order Blocks, Candlesticks, Positions, Arrows, Text, Fibonacci).
              </p>
              <textarea
                rows={8}
                value={sampleForm.shapesJson}
                onChange={(e) => setSampleForm({ ...sampleForm, shapesJson: e.target.value })}
                className="w-full rounded-xl border border-line bg-slate-900 text-emerald-400 font-mono p-3 text-xs outline-none focus:border-brand resize-y"
              />
            </Field>

            <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSampleModalOpen(false)}
                className="btn-outline-dark !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSample}
                className="btn-primary !py-2 !px-5 text-xs font-bold"
              >
                {editingSample ? "Save Changes" : "Create Template"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================= MODAL: ADD / EDIT RESOURCE & GUIDE ======================= */}
      {resourceModalOpen && (
        <Modal
          title={editingResource ? "Edit Resource Blueprint" : "Add New Resource Blueprint"}
          subtitle="Publish step-by-step institutional playbooks and technical guides for students."
          onClose={() => setResourceModalOpen(false)}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <Field label="Resource Title">
              <input
                type="text"
                value={resourceForm.title}
                onChange={(e) => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g. SMC Institutional POI Playbook"
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
              />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <input
                  type="text"
                  value={resourceForm.category}
                  onChange={(e) => setResourceForm({ ...resourceForm, category: e.target.value })}
                  placeholder="e.g. Smart Money Concepts, Market Timing..."
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                />
              </Field>

              <Field label="Badge Text">
                <input
                  type="text"
                  value={resourceForm.badge}
                  onChange={(e) => setResourceForm({ ...resourceForm, badge: e.target.value })}
                  placeholder="e.g. Most Popular, Essential, Session Timing..."
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                />
              </Field>
            </div>

            <Field label="Description">
              <textarea
                rows={3}
                value={resourceForm.desc}
                onChange={(e) => setResourceForm({ ...resourceForm, desc: e.target.value })}
                placeholder="Summary of the guide and what the student will learn..."
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink outline-none focus:border-brand resize-none"
              />
            </Field>

            <Field label="Key Learning Points (One per line)">
              <textarea
                rows={5}
                value={resourceForm.pointsText}
                onChange={(e) => setResourceForm({ ...resourceForm, pointsText: e.target.value })}
                placeholder="• Point 1&#10;• Point 2&#10;• Point 3"
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink outline-none focus:border-brand resize-none"
              />
            </Field>

            <Field label="Whiteboard Action Button Label">
              <input
                type="text"
                value={resourceForm.actionLabel}
                onChange={(e) => setResourceForm({ ...resourceForm, actionLabel: e.target.value })}
                placeholder="e.g. Create Canvas with Guide, Open Risk Template..."
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
              />
            </Field>

            <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResourceModalOpen(false)}
                className="btn-outline-dark !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveResource}
                className="btn-primary !py-2 !px-5 text-xs font-bold"
              >
                {editingResource ? "Save Changes" : "Create Resource"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ======================= MODAL: ADD / EDIT PLAYBOOK LESSON ======================= */}
      {lessonModalOpen && (
        <Modal
          title={editingLesson ? "Edit Playbook Lesson" : "Add Playbook Lesson"}
          subtitle="Add step-by-step hotkeys and feature walkthrough tips."
          onClose={() => setLessonModalOpen(false)}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-4 gap-3">
              <Field label="Lesson Number">
                <input
                  type="text"
                  value={lessonForm.num}
                  onChange={(e) => setLessonForm({ ...lessonForm, num: e.target.value })}
                  placeholder="01"
                  className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-mono font-bold text-ink outline-none focus:border-brand text-center"
                />
              </Field>
              <div className="col-span-3">
                <Field label="Lesson Title">
                  <input
                    type="text"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="e.g. Smart Money Concepts (SMC) Markup"
                    className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
                  />
                </Field>
              </div>
            </div>

            <Field label="Subtitle">
              <input
                type="text"
                value={lessonForm.subtitle}
                onChange={(e) => setLessonForm({ ...lessonForm, subtitle: e.target.value })}
                placeholder="e.g. Institutional supply/demand zones"
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-bold text-ink outline-none focus:border-brand"
              />
            </Field>

            <Field label="Detailed Explanation">
              <textarea
                rows={3}
                value={lessonForm.desc}
                onChange={(e) => setLessonForm({ ...lessonForm, desc: e.target.value })}
                placeholder="Provide instructions on hotkeys and techniques..."
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink outline-none focus:border-brand resize-none"
              />
            </Field>

            <Field label="Features & Hotkeys (Format: Label | Value per line)">
              <textarea
                rows={5}
                value={lessonForm.itemsText}
                onChange={(e) => setLessonForm({ ...lessonForm, itemsText: e.target.value })}
                placeholder="Order Blocks (OB) | Translucent Demand Zones&#10;Fib Tool Hotkey | Press F"
                className="w-full rounded-xl border border-line bg-white p-2.5 text-xs font-medium text-ink outline-none focus:border-brand resize-none font-mono"
              />
            </Field>

            <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setLessonModalOpen(false)}
                className="btn-outline-dark !py-2 !px-4 text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLesson}
                className="btn-primary !py-2 !px-5 text-xs font-bold"
              >
                {editingLesson ? "Save Changes" : "Create Lesson"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminShell>
  );
}
