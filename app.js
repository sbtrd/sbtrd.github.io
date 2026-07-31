/* Conduct'Home v1.85 — semaine chantier et calendrier rendez-vous. */
(function (global) {
'use strict';
const modules = {
"src/App": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Sidebar_1 = require("./components/Sidebar");
const Dashboard_1 = require("./components/Dashboard");
const PlanningBoard_1 = require("./components/PlanningBoard");
const WeekView_1 = require("./components/WeekView");
const CalendarView_1 = require("./components/CalendarView");
const ProjectsView_1 = require("./components/ProjectsView");
const DocumentsView_1 = require("./components/DocumentsView");
const OrdersView_1 = require("./components/OrdersView");
const ArtisansView_1 = require("./components/ArtisansView");
const NotificationsView_1 = require("./components/NotificationsView");
const TasksView_1 = require("./components/TasksView");
const Modal_1 = require("./components/Modal");
const ViewErrorBoundary_1 = require("./components/ViewErrorBoundary");
const AuthScreen_1 = require("./components/AuthScreen");
const stages_1 = require("./data/stages");
const planning_1 = require("./lib/planning");
const auth_1 = require("./lib/auth");
const projectSharing_1 = require("./lib/projectSharing");
const repository_1 = require("./lib/repository");
const today = new Date().toISOString().slice(0, 10);
const defaultEndDate = new Date(Date.now() + 240 * 86400000).toISOString().slice(0, 10);
const emptyProject = {
    name: '',
    projectNumber: '',
    city: '',
    postalCode: '',
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    address: '',
    startDate: today,
    targetEndDate: defaultEndDate,
};
function App() {
    const [currentUser, setCurrentUser] = (0, react_1.useState)();
    const [authReady, setAuthReady] = (0, react_1.useState)(true);
    const [view, setView] = (0, react_1.useState)('dashboard');
    const [projects, setProjects] = (0, react_1.useState)([]);
    const [lots, setLots] = (0, react_1.useState)([]);
    const [artisans, setArtisans] = (0, react_1.useState)([]);
    const [documents, setDocuments] = (0, react_1.useState)([]);
    const [tasks, setTasks] = (0, react_1.useState)([]);
    const [calendarEvents, setCalendarEvents] = (0, react_1.useState)([]);
    const [selectedProjectId, setSelectedProjectId] = (0, react_1.useState)();
    const [newProjectOpen, setNewProjectOpen] = (0, react_1.useState)(false);
    const [newProject, setNewProject] = (0, react_1.useState)(emptyProject);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)();
    const [error, setError] = (0, react_1.useState)();
    const [dismissedNotificationIds, setDismissedNotificationIds] = (0, react_1.useState)([]);
    const [sharedProjectPayload, setSharedProjectPayload] = (0, react_1.useState)();
    const [importingSharedProject, setImportingSharedProject] = (0, react_1.useState)(false);
    const activeProjects = (0, react_1.useMemo)(() => projects.filter((project) => !project.archivedAt), [projects]);
    const allNotifications = (0, react_1.useMemo)(() => (0, planning_1.buildNotifications)(activeProjects, artisans), [activeProjects, artisans]);
    const notifications = (0, react_1.useMemo)(() => allNotifications.filter((notification) => !dismissedNotificationIds.includes(notification.id)), [allNotifications, dismissedNotificationIds]);
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        let unsubscribe;
        (0, auth_1.onAuthUserChanged)((user) => {
            if (cancelled)
                return;
            setCurrentUser(user);
            setAuthReady(true);
        })
            .then((handler) => {
            if (cancelled)
                handler();
            else
                unsubscribe = handler;
        })
            .catch(() => {
            if (!cancelled)
                setAuthReady(true);
        });
        return () => {
            cancelled = true;
            if (unsubscribe)
                unsubscribe();
        };
    }, []);
    (0, react_1.useEffect)(() => {
        if (!currentUser) {
            setLoading(false);
            return;
        }
        let active = true;
        setLoading(true);
        Promise.all([(0, repository_1.loadAppData)(), (0, repository_1.loadDismissedNotificationIds)()])
            .then(([data, dismissedIds]) => {
            if (!active)
                return;
            setProjects(data.projects);
            setLots(data.lots);
            setArtisans(data.artisans);
            setDocuments(data.documents);
            setTasks(data.tasks);
            setCalendarEvents(data.calendarEvents);
            setDismissedNotificationIds(dismissedIds);
            setSelectedProjectId(data.projects.find((project) => !project.archivedAt)?.id ?? data.projects[0]?.id);
        })
            .catch((reason) => {
            setError(reason instanceof Error ? reason.message : 'Impossible de charger les données.');
        })
            .finally(() => setLoading(false));
        return () => { active = false; };
    }, [currentUser]);
    (0, react_1.useEffect)(() => {
        if (!currentUser)
            return;
        const payload = (0, projectSharing_1.readSharedProjectFromLocation)();
        if (payload)
            setSharedProjectPayload(payload);
    }, [currentUser]);
    (0, react_1.useEffect)(() => {
        if (!currentUser)
            return;
        const sync = () => void (0, repository_1.syncWorkspaceNow)();
        const timer = window.setInterval(sync, 8000);
        window.addEventListener('focus', sync);
        window.addEventListener('online', sync);
        sync();
        return () => {
            window.clearInterval(timer);
            window.removeEventListener('focus', sync);
            window.removeEventListener('online', sync);
        };
    }, [currentUser]);
    (0, react_1.useEffect)(() => {
        if (!message)
            return;
        const timer = window.setTimeout(() => setMessage(undefined), 2800);
        return () => window.clearTimeout(timer);
    }, [message]);
    (0, react_1.useEffect)(() => {
        const handleRemoteSync = (event) => {
            const data = event.detail;
            if (!data)
                return;
            setProjects(data.projects);
            setLots(data.lots);
            setArtisans(data.artisans);
            setDocuments(data.documents);
            setTasks(data.tasks);
            setCalendarEvents(data.calendarEvents);
            setSelectedProjectId(data.projects.find((project) => !project.archivedAt)?.id ?? data.projects[0]?.id);
        };
        window.addEventListener('conduct-home-remote-sync', handleRemoteSync);
        return () => window.removeEventListener('conduct-home-remote-sync', handleRemoteSync);
    }, []);
    const importSharedProject = async () => {
        if (!sharedProjectPayload)
            return;
        setImportingSharedProject(true);
        try {
            const timestamp = new Date().toISOString();
            const imported = {
                ...sharedProjectPayload.project,
                id: `p-${crypto.randomUUID()}`,
                archivedAt: undefined,
                archiveReason: undefined,
                createdAt: timestamp,
                updatedAt: timestamp,
                sharedFrom: sharedProjectPayload.sharedBy,
                sharedAt: sharedProjectPayload.sharedAt,
                stages: sharedProjectPayload.project.stages.map((stage) => ({ ...stage })),
                meetings: sharedProjectPayload.project.meetings?.map((meeting) => ({ ...meeting })),
                controlChecks: sharedProjectPayload.project.controlChecks?.map((check) => ({ ...check })),
            };
            await (0, repository_1.saveProject)(imported);
            setProjects((current) => [...current, imported]);
            setSelectedProjectId(imported.id);
            setView('projects');
            setSharedProjectPayload(undefined);
            (0, projectSharing_1.clearSharedProjectHash)();
            setMessage(`Le chantier ${imported.name} a été importé dans ton compte.`);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Import du chantier impossible.');
        }
        finally {
            setImportingSharedProject(false);
        }
    };
    const handleSaveProject = async (project) => {
        const previousProject = projects.find((item) => item.id === project.id);
        const remindersToCreate = stages_1.MEETING_REMINDER_STAGE_IDS.flatMap((stageId) => {
            const wasDone = previousProject?.stages.find((stage) => stage.stageId === stageId)?.status === 'done';
            const isDone = project.stages.find((stage) => stage.stageId === stageId)?.status === 'done';
            const taskId = `task-rdv-client-${stageId}-${project.id}`;
            const alreadyExists = tasks.some((task) => task.id === taskId);
            if (!isDone || wasDone || alreadyExists)
                return [];
            const definition = stages_1.STAGES.find((stage) => stage.id === stageId);
            return definition ? [{ stageId, taskId, stageLabel: definition.label }] : [];
        });
        try {
            await (0, repository_1.saveProject)(project);
            setProjects((current) => {
                const exists = current.some((item) => item.id === project.id);
                return exists ? current.map((item) => item.id === project.id ? project : item) : [...current, project];
            });
            if (remindersToCreate.length > 0) {
                const now = new Date().toISOString();
                const createdTasks = [];
                for (const reminder of remindersToCreate) {
                    const meetingTask = {
                        id: reminder.taskId,
                        title: `Prendre rendez-vous avec ${project.clientName}`,
                        details: `L’étape « ${reminder.stageLabel} » du chantier ${project.name} est terminée. Organiser une réunion sur chantier avec ${project.clientName}.`,
                        dueDate: now.slice(0, 10),
                        priority: 'high',
                        projectId: project.id,
                        createdAt: now,
                        updatedAt: now,
                    };
                    await (0, repository_1.saveTask)(meetingTask);
                    createdTasks.push(meetingTask);
                }
                setTasks((current) => [
                    ...createdTasks,
                    ...current.filter((task) => !createdTasks.some((created) => created.id === task.id)),
                ]);
                setMessage(createdTasks.length === 1
                    ? `${remindersToCreate[0].stageLabel} terminée : une tâche importante a été ajoutée pour prendre rendez-vous avec ${project.clientName}.`
                    : `${createdTasks.length} tâches importantes ont été ajoutées pour organiser les réunions avec ${project.clientName}.`);
            }
            else {
                setMessage('Modifications enregistrées.');
            }
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Enregistrement impossible.');
            throw reason;
        }
    };
    const handleArchiveProject = async (project, reason) => {
        const archived = {
            ...project,
            archivedAt: new Date().toISOString(),
            archiveReason: reason,
            updatedAt: new Date().toISOString(),
        };
        try {
            await (0, repository_1.saveProject)(archived);
            setProjects((current) => current.map((item) => item.id === archived.id ? archived : item));
            setSelectedProjectId(archived.id);
            setView('projects');
            setMessage('Chantier archivé. Le dossier complet reste disponible.');
        }
        catch (reasonValue) {
            setError(reasonValue instanceof Error ? reasonValue.message : 'Archivage impossible.');
            throw reasonValue;
        }
    };
    const handleRestoreProject = async (project) => {
        const restored = { ...project, updatedAt: new Date().toISOString() };
        delete restored.archivedAt;
        delete restored.archiveReason;
        try {
            await (0, repository_1.saveProject)(restored);
            setProjects((current) => current.map((item) => item.id === restored.id ? restored : item));
            setSelectedProjectId(restored.id);
            setMessage('Chantier restauré dans le planning.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Restauration impossible.');
            throw reason;
        }
    };
    const createProject = async () => {
        if (!newProject.name.trim() || !newProject.city.trim() || !newProject.clientName.trim()) {
            setError('Le nom du chantier, la ville et le client sont obligatoires.');
            return;
        }
        setSaving(true);
        setError(undefined);
        const project = {
            id: `p-${crypto.randomUUID()}`,
            name: newProject.name.trim().toUpperCase(),
            projectNumber: newProject.projectNumber.trim() || undefined,
            city: newProject.city.trim(),
            postalCode: newProject.postalCode.trim() || undefined,
            clientName: newProject.clientName.trim(),
            clientPhone: newProject.clientPhone.trim() || undefined,
            clientEmail: newProject.clientEmail.trim() || undefined,
            address: newProject.address.trim() || undefined,
            startDate: newProject.startDate,
            targetEndDate: newProject.targetEndDate,
            status: 'on_track',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stages: stages_1.STAGES.map((stage) => ({
                stageId: stage.id,
                status: 'todo',
            })),
        };
        try {
            await (0, repository_1.saveProject)(project);
            setProjects((current) => [...current, project]);
            setSelectedProjectId(project.id);
            setNewProject(emptyProject);
            setNewProjectOpen(false);
            setView('planning');
            setMessage('Nouveau chantier créé.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Création impossible.');
        }
        finally {
            setSaving(false);
        }
    };
    const handleUploadConvention = async (file) => {
        return (0, repository_1.saveArtisanConvention)(file);
    };
    const handleSaveArtisan = async (artisan) => {
        try {
            await (0, repository_1.saveArtisan)(artisan);
            setArtisans((current) => {
                const exists = current.some((item) => item.id === artisan.id);
                const next = exists
                    ? current.map((item) => item.id === artisan.id ? artisan : item)
                    : [...current, artisan];
                return next.sort((a, b) => a.company.localeCompare(b.company, 'fr'));
            });
            setMessage('Fiche entreprise enregistrée.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : "Enregistrement de l'entreprise impossible.");
            throw reason;
        }
    };
    const handleDeleteArtisan = async (artisan) => {
        try {
            await (0, repository_1.removeArtisan)(artisan.id);
            setArtisans((current) => current.filter((item) => item.id !== artisan.id));
            setMessage('Entreprise supprimée du carnet d’adresses.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : "Suppression de l'entreprise impossible.");
            throw reason;
        }
    };
    const handleSaveLot = async (lot) => {
        try {
            const nextLots = await (0, repository_1.saveLot)(lot);
            setLots(nextLots);
            setMessage(lots.some((item) => item.id === lot.id) ? 'Lot modifié.' : 'Lot ajouté.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Enregistrement du lot impossible.');
            throw reason;
        }
    };
    const handleDeleteLot = async (lot) => {
        try {
            const nextLots = await (0, repository_1.removeLot)(lot.id);
            setLots(nextLots);
            setMessage('Lot supprimé. La numérotation a été mise à jour.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Suppression du lot impossible.');
            throw reason;
        }
    };
    const handleUpload = async (file, projectId, category) => {
        try {
            const saved = await (0, repository_1.uploadDocument)(file, { projectId, name: file.name, category });
            setDocuments((current) => [saved, ...current]);
            setMessage('Document sauvegardé sur cet ordinateur.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Envoi du document impossible.');
        }
    };
    const handleMoveDocument = async (document, category) => {
        try {
            const moved = await (0, repository_1.moveDocumentCategory)(document.id, category);
            setDocuments((current) => current.map((item) => item.id === moved.id ? moved : item));
            setMessage(`Document déplacé dans ${category}.`);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Déplacement du document impossible.');
            throw reason;
        }
    };
    const handleDeleteDocument = async (document) => {
        try {
            await (0, repository_1.removeDocument)(document.id);
            setDocuments((current) => current.filter((item) => item.id !== document.id));
            setMessage('Document supprimé définitivement.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Suppression du document impossible.');
            throw reason;
        }
    };
    const handleOpenDocument = async (document) => {
        const previewWindow = window.open('', '_blank');
        if (!previewWindow) {
            setError('Le navigateur a bloqué l’ouverture du document. Autorise les fenêtres contextuelles pour ce site.');
            return;
        }
        previewWindow.document.title = 'Ouverture du document…';
        previewWindow.document.body.innerHTML = '<p style="font-family:system-ui;padding:24px">Ouverture du document…</p>';
        try {
            const { url, temporary } = await (0, repository_1.getDocumentUrl)(document);
            previewWindow.location.replace(url);
            if (temporary)
                window.setTimeout(() => URL.revokeObjectURL(url), 120000);
        }
        catch (reason) {
            previewWindow.close();
            setError(reason instanceof Error ? reason.message : 'Impossible d’ouvrir le document.');
        }
    };
    const handleDismissNotification = async (notificationId) => {
        setDismissedNotificationIds((current) => current.includes(notificationId) ? current : [...current, notificationId]);
        try {
            await (0, repository_1.dismissNotification)(notificationId);
            setMessage('Alerte marquée comme traitée.');
        }
        catch (reason) {
            setDismissedNotificationIds((current) => current.filter((id) => id !== notificationId));
            setError(reason instanceof Error ? reason.message : 'Impossible de traiter cette alerte.');
        }
    };
    const handleCreateTask = async (draft) => {
        const now = new Date().toISOString();
        const task = {
            id: `task-${crypto.randomUUID()}`,
            title: draft.title,
            details: draft.details,
            dueDate: draft.dueDate,
            priority: draft.priority,
            projectId: draft.projectId,
            createdAt: now,
            updatedAt: now,
        };
        try {
            await (0, repository_1.saveTask)(task);
            setTasks((current) => [task, ...current.filter((item) => item.id !== task.id)]);
            setMessage('Tâche ajoutée.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Ajout de la tâche impossible.');
            throw reason;
        }
    };
    const handleCompleteTask = async (task) => {
        const completed = {
            ...task,
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        try {
            await (0, repository_1.saveTask)(completed);
            setTasks((current) => current.map((item) => item.id === task.id ? completed : item));
            setMessage('Tâche terminée.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Impossible de terminer la tâche.');
            throw reason;
        }
    };
    const handleDeleteTask = async (task) => {
        try {
            await (0, repository_1.removeTask)(task.id);
            setTasks((current) => current.filter((item) => item.id !== task.id));
            setMessage('Tâche supprimée.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Suppression de la tâche impossible.');
            throw reason;
        }
    };
    const handleSaveCalendarEvent = async (event) => {
        try {
            await (0, repository_1.saveCalendarEvent)(event);
            setCalendarEvents((current) => current.some((item) => item.id === event.id)
                ? current.map((item) => item.id === event.id ? event : item)
                : [...current, event]);
            setMessage('Rendez-vous enregistré dans le calendrier.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Enregistrement du rendez-vous impossible.');
            throw reason;
        }
    };
    const handleDeleteCalendarEvent = async (event) => {
        try {
            await (0, repository_1.removeCalendarEvent)(event.id);
            setCalendarEvents((current) => current.filter((item) => item.id !== event.id));
            setMessage('Rendez-vous supprimé du calendrier.');
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Suppression du rendez-vous impossible.');
            throw reason;
        }
    };
    const openProject = (projectId) => {
        setSelectedProjectId(projectId);
        setView('projects');
    };
    const handleAuthenticated = (user) => {
        setCurrentUser(user);
        setView('dashboard');
        setProjects([]);
        setLots([]);
        setArtisans([]);
        setDocuments([]);
        setTasks([]);
        setCalendarEvents([]);
        setDismissedNotificationIds([]);
    };
    const handleLogout = async () => {
        await (0, auth_1.logoutLocalAccount)();
        setCurrentUser(undefined);
        setProjects([]);
        setLots([]);
        setArtisans([]);
        setDocuments([]);
        setTasks([]);
        setCalendarEvents([]);
        setDismissedNotificationIds([]);
        setSelectedProjectId(undefined);
        setView('dashboard');
    };
    if (!authReady) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "loading-screen", children: [(0, jsx_runtime_1.jsx)("div", {}), (0, jsx_runtime_1.jsx)("span", { children: "Connexion au compte\u2026" })] }));
    }
    if (!currentUser) {
        return (0, jsx_runtime_1.jsx)(AuthScreen_1.AuthScreen, { onAuthenticated: handleAuthenticated });
    }
    if (loading) {
        return (0, jsx_runtime_1.jsxs)("div", { className: "app-loading", children: [(0, jsx_runtime_1.jsx)("div", { className: "loader" }), (0, jsx_runtime_1.jsx)("strong", { children: "Chargement de l\u2019espace ARLOGIS\u2026" })] });
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "app-shell", children: [(0, jsx_runtime_1.jsx)(Sidebar_1.Sidebar, { active: view, onChange: setView, notificationCount: notifications.length, taskCount: tasks.filter((task) => !task.completedAt).length }), (0, jsx_runtime_1.jsxs)("main", { className: "main-shell", children: [(0, jsx_runtime_1.jsxs)("div", { className: "topbar", children: [(0, jsx_runtime_1.jsx)("div", {}), (0, jsx_runtime_1.jsxs)("div", { className: "topbar-actions", children: [(0, jsx_runtime_1.jsxs)("button", { className: "notification-button", onClick: () => setView('notifications'), "aria-label": "Voir les alertes", children: ["!", (0, jsx_runtime_1.jsx)("span", { children: notifications.length })] }), (0, jsx_runtime_1.jsx)("button", { className: "logout-button", onClick: handleLogout, children: "D\u00E9connexion" }), (0, jsx_runtime_1.jsxs)("div", { className: "user-chip", children: [(0, jsx_runtime_1.jsx)("div", { children: (currentUser.name || currentUser.email).slice(0, 2).toUpperCase() }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("strong", { children: currentUser.name || 'Conducteur de travaux' }), (0, jsx_runtime_1.jsx)("small", { children: currentUser.email })] })] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "page-content", children: (0, jsx_runtime_1.jsxs)(ViewErrorBoundary_1.ViewErrorBoundary, { children: [view === 'dashboard' && (0, jsx_runtime_1.jsx)(Dashboard_1.Dashboard, { projects: activeProjects, notifications: notifications, tasks: tasks, calendarEvents: calendarEvents, onOpenPlanning: () => setView('planning'), onOpenWeek: () => setView('week'), onOpenCalendar: () => setView('calendar'), onOpenProject: openProject, onOpenTasks: () => setView('tasks'), onCompleteTask: handleCompleteTask }), view === 'week' && (0, jsx_runtime_1.jsx)(WeekView_1.WeekView, { projects: activeProjects, onOpenProject: openProject, onOpenPlanning: () => setView('planning') }), view === 'calendar' && (0, jsx_runtime_1.jsx)(CalendarView_1.CalendarView, { projects: activeProjects, events: calendarEvents, onSaveEvent: handleSaveCalendarEvent, onDeleteEvent: handleDeleteCalendarEvent }), view === 'tasks' && (0, jsx_runtime_1.jsx)(TasksView_1.TasksView, { projects: activeProjects, tasks: tasks, onCreate: handleCreateTask, onComplete: handleCompleteTask, onDelete: handleDeleteTask }), view === 'planning' && (0, jsx_runtime_1.jsx)(PlanningBoard_1.PlanningBoard, { projects: activeProjects, lots: lots, artisans: artisans, onSaveProject: handleSaveProject, onAddProject: () => setNewProjectOpen(true) }), view === 'projects' && ((0, jsx_runtime_1.jsx)(ProjectsView_1.ProjectsView, { projects: projects, documents: documents, selectedProjectId: selectedProjectId, onSelect: setSelectedProjectId, onAddProject: () => setNewProjectOpen(true), onSaveProject: handleSaveProject, onArchiveProject: handleArchiveProject, onRestoreProject: handleRestoreProject, onOpenDocument: handleOpenDocument, currentUserEmail: currentUser.email })), view === 'documents' && (0, jsx_runtime_1.jsx)(DocumentsView_1.DocumentsView, { projects: activeProjects, documents: documents, onUpload: handleUpload, onOpenDocument: handleOpenDocument, onMoveDocument: handleMoveDocument, onDeleteDocument: handleDeleteDocument }), view === 'orders' && (0, jsx_runtime_1.jsx)(OrdersView_1.OrdersView, { projects: activeProjects, artisans: artisans, documents: documents }), view === 'artisans' && ((0, jsx_runtime_1.jsx)(ArtisansView_1.ArtisansView, { lots: lots, artisans: artisans, onSaveLot: handleSaveLot, onDeleteLot: handleDeleteLot, onSaveArtisan: handleSaveArtisan, onDeleteArtisan: handleDeleteArtisan, onUploadConvention: handleUploadConvention })), view === 'notifications' && (0, jsx_runtime_1.jsx)(NotificationsView_1.NotificationsView, { notifications: notifications, onDismiss: handleDismissNotification })] }, view) })] }), sharedProjectPayload && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: "Chantier partag\u00E9", onClose: () => { setSharedProjectPayload(undefined); (0, projectSharing_1.clearSharedProjectHash)(); }, children: [(0, jsx_runtime_1.jsxs)("div", { className: "shared-project-import", children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Invitation re\u00E7ue" }), (0, jsx_runtime_1.jsx)("h3", { children: sharedProjectPayload.project.name }), (0, jsx_runtime_1.jsxs)("p", { children: [sharedProjectPayload.project.clientName, " \u00B7 ", sharedProjectPayload.project.city] }), sharedProjectPayload.sharedBy && (0, jsx_runtime_1.jsxs)("small", { children: ["Partag\u00E9 par ", sharedProjectPayload.sharedBy] }), (0, jsx_runtime_1.jsxs)("div", { className: "shared-project-summary", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes" }), (0, jsx_runtime_1.jsx)("strong", { children: sharedProjectPayload.project.stages.length })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Avancement" }), (0, jsx_runtime_1.jsxs)("strong", { children: [(0, planning_1.getProgress)(sharedProjectPayload.project), "%"] })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "share-project-warning", children: "L\u2019import cr\u00E9e une copie du chantier dans ton compte. Les fichiers stock\u00E9s uniquement sur l\u2019ordinateur de l\u2019exp\u00E9diteur ne sont pas transf\u00E9r\u00E9s." })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => { setSharedProjectPayload(undefined); (0, projectSharing_1.clearSharedProjectHash)(); }, children: "Refuser" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: importingSharedProject, onClick: () => void importSharedProject(), children: importingSharedProject ? 'Import en cours…' : 'Importer le chantier' })] })] })), newProjectOpen && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: "Cr\u00E9er un chantier", onClose: () => setNewProjectOpen(false), children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du chantier *" }), (0, jsx_runtime_1.jsx)("input", { value: newProject.name, onChange: (event) => setNewProject({ ...newProject, name: event.target.value }), placeholder: "Ex. DUPONT" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "N\u00B0 de dossier" }), (0, jsx_runtime_1.jsx)("input", { value: newProject.projectNumber, onChange: (event) => setNewProject({ ...newProject, projectNumber: event.target.value }), placeholder: "Ex. 2026-014" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du client *" }), (0, jsx_runtime_1.jsx)("input", { value: newProject.clientName, onChange: (event) => setNewProject({ ...newProject, clientName: event.target.value }), placeholder: "M. et Mme Dupont" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E9l\u00E9phone" }), (0, jsx_runtime_1.jsx)("input", { type: "tel", value: newProject.clientPhone, onChange: (event) => setNewProject({ ...newProject, clientPhone: event.target.value }), placeholder: "06 00 00 00 00" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: newProject.clientEmail, onChange: (event) => setNewProject({ ...newProject, clientEmail: event.target.value }), placeholder: "client@email.fr" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse du chantier" }), (0, jsx_runtime_1.jsx)("input", { value: newProject.address, onChange: (event) => setNewProject({ ...newProject, address: event.target.value }), placeholder: "Num\u00E9ro et rue" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Code postal" }), (0, jsx_runtime_1.jsx)("input", { value: newProject.postalCode, onChange: (event) => setNewProject({ ...newProject, postalCode: event.target.value }), placeholder: "87000" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Ville *" }), (0, jsx_runtime_1.jsx)("input", { value: newProject.city, onChange: (event) => setNewProject({ ...newProject, city: event.target.value }), placeholder: "Ex. Limoges" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date d'ouverture" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: newProject.startDate, onChange: (event) => setNewProject({ ...newProject, startDate: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "R\u00E9ception cible" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: newProject.targetEndDate, onChange: (event) => setNewProject({ ...newProject, targetEndDate: event.target.value }) })] })] }), (0, jsx_runtime_1.jsxs)("p", { className: "form-note", children: ["Le dossier client et la trame compl\u00E8te de ", stages_1.STAGES.length, " \u00E9tapes seront cr\u00E9\u00E9s ensemble. Tu pourras compl\u00E9ter les informations depuis l\u2019onglet Chantiers."] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setNewProjectOpen(false), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: saving, onClick: createProject, children: saving ? 'Création…' : 'Créer le chantier' })] })] })), message && (0, jsx_runtime_1.jsxs)("div", { className: "toast success", children: ["\u2713 ", message] }), error && (0, jsx_runtime_1.jsxs)("div", { className: "toast error", children: [(0, jsx_runtime_1.jsx)("span", { children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setError(undefined), children: "\u00D7" })] })] }));
}
exports.default = App;

},
"src/components/ArtisansView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtisansView = ArtisansView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lots_1 = require("../data/lots");
const stages_1 = require("../data/stages");
const artisans_1 = require("../lib/artisans");
const Modal_1 = require("./Modal");
const emptyArtisanForm = {
    company: '',
    lotId: '',
    stageIds: [],
    contactName: '',
    phone: '',
    email: '',
    code: '',
    leadTimeDays: '7',
    note: '',
    orderEmail: '',
};
const emptyLotForm = {
    name: '',
    code: '',
    stageIds: [],
};
const normalize = artisans_1.normalizeTradeName;
function ArtisansView({ lots, artisans, onSaveLot, onDeleteLot, onSaveArtisan, onDeleteArtisan, onUploadConvention, }) {
    const [search, setSearch] = (0, react_1.useState)('');
    const [lotFilter, setLotFilter] = (0, react_1.useState)('all');
    const [selected, setSelected] = (0, react_1.useState)(null);
    const [editingArtisan, setEditingArtisan] = (0, react_1.useState)(null);
    const [editingLot, setEditingLot] = (0, react_1.useState)(null);
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [savingLot, setSavingLot] = (0, react_1.useState)(false);
    const [formError, setFormError] = (0, react_1.useState)();
    const [lotFormError, setLotFormError] = (0, react_1.useState)();
    const conventionInputRef = (0, react_1.useRef)(null);
    const [uploadingConvention, setUploadingConvention] = (0, react_1.useState)(false);
    const [collapsedLotIds, setCollapsedLotIds] = (0, react_1.useState)(() => lots.map((lot) => lot.id));
    const initialLotCollapseApplied = (0, react_1.useRef)(lots.length > 0);
    (0, react_1.useEffect)(() => {
        if (initialLotCollapseApplied.current || lots.length === 0)
            return;
        setCollapsedLotIds(lots.map((lot) => lot.id));
        initialLotCollapseApplied.current = true;
    }, [lots]);
    const sortedLots = (0, react_1.useMemo)(() => [...lots].sort((a, b) => (0, lots_1.getLotOrder)(a) - (0, lots_1.getLotOrder)(b)), [lots]);
    const groups = (0, react_1.useMemo)(() => {
        const query = normalize(search);
        return sortedLots
            .filter((lot) => lotFilter === 'all' || lot.id === lotFilter)
            .map((lot) => {
            const lotStageNames = stages_1.STAGES.filter((stage) => (0, artisans_1.getLotStageIds)(lot).includes(stage.id)).map((stage) => stage.label);
            const lotMatches = !query || normalize(`${lot.name} ${lot.code ?? ''} ${lotStageNames.join(' ')}`).includes(query);
            const matchingArtisans = artisans
                .filter((artisan) => (0, artisans_1.artisanBelongsToLot)(artisan, lot.id, lots))
                .filter((artisan) => lotMatches || normalize(`${artisan.company} ${artisan.contactName} ${artisan.code} ${artisan.email} ${(0, artisans_1.getArtisanStageNames)(artisan, lots).join(' ')}`).includes(query))
                .sort((a, b) => a.company.localeCompare(b.company, 'fr'));
            return { lot, artisans: matchingArtisans, visible: lotMatches || matchingArtisans.length > 0 };
        })
            .filter((group) => group.visible);
    }, [sortedLots, lotFilter, search, artisans, lots]);
    const unclassifiedArtisans = (0, react_1.useMemo)(() => {
        if (lotFilter !== 'all')
            return [];
        const query = normalize(search);
        return artisans
            .filter((artisan) => !(0, artisans_1.getArtisanPrimaryLotId)(artisan, lots))
            .filter((artisan) => !query || normalize(`${artisan.company} ${artisan.contactName} ${(0, artisans_1.getArtisanStageNames)(artisan, lots).join(' ')}`).includes(query))
            .sort((a, b) => a.company.localeCompare(b.company, 'fr'));
    }, [artisans, lots, lotFilter, search]);
    const displayedArtisanCount = (0, react_1.useMemo)(() => new Set([
        ...groups.flatMap((group) => group.artisans.map((artisan) => artisan.id)),
        ...unclassifiedArtisans.map((artisan) => artisan.id),
    ]).size, [groups, unclassifiedArtisans]);
    const startCreateLot = () => {
        setLotFormError(undefined);
        setEditingLot({ ...emptyLotForm });
    };
    const startEditLot = (lot) => {
        setLotFormError(undefined);
        setEditingLot({
            id: lot.id,
            name: lot.name,
            code: lot.code ?? '',
            stageIds: (0, artisans_1.getLotStageIds)(lot),
            order: lot.order,
            createdAt: lot.createdAt,
        });
    };
    const toggleLotStage = (stageId) => {
        if (!editingLot)
            return;
        const selectedIds = new Set(editingLot.stageIds);
        if (selectedIds.has(stageId))
            selectedIds.delete(stageId);
        else
            selectedIds.add(stageId);
        setEditingLot({ ...editingLot, stageIds: Array.from(selectedIds) });
    };
    const saveLotForm = async () => {
        if (!editingLot)
            return;
        const name = editingLot.name.trim();
        if (!name) {
            setLotFormError('Le nom du lot est obligatoire.');
            return;
        }
        const duplicate = lots.some((lot) => lot.id !== editingLot.id && normalize(lot.name) === normalize(name));
        if (duplicate) {
            setLotFormError('Un lot portant ce nom existe déjà.');
            return;
        }
        const timestamp = new Date().toISOString();
        const lot = {
            id: editingLot.id ?? `lot-${crypto.randomUUID()}`,
            order: editingLot.order ?? sortedLots.length + 1,
            name,
            code: editingLot.code.trim().toUpperCase() || name.slice(0, 8).toUpperCase(),
            stageIds: stages_1.STAGES.filter((stage) => editingLot.stageIds.includes(stage.id)).map((stage) => stage.id),
            createdAt: editingLot.createdAt ?? timestamp,
            updatedAt: timestamp,
            fixed: false,
        };
        setSavingLot(true);
        setLotFormError(undefined);
        try {
            await onSaveLot(lot);
            setEditingLot(null);
        }
        catch (reason) {
            setLotFormError(reason instanceof Error ? reason.message : "Impossible d'enregistrer le lot.");
        }
        finally {
            setSavingLot(false);
        }
    };
    const deleteLot = async (lot) => {
        const confirmed = window.confirm(`Supprimer le lot « ${lot.name} » ?\n\nLes entreprises ne seront pas supprimées. Elles resteront enregistrées avec leurs étapes d'intervention.`);
        if (!confirmed)
            return;
        try {
            await onDeleteLot(lot);
            if (lotFilter === lot.id)
                setLotFilter('all');
        }
        catch {
            // Le parent affiche déjà le message d'erreur.
        }
    };
    const startCreateArtisan = (lotId) => {
        setSelected(null);
        setFormError(undefined);
        const lot = lotId ? lots.find((item) => item.id === lotId) : undefined;
        setEditingArtisan({
            ...emptyArtisanForm,
            lotId: lot?.id ?? '',
            stageIds: lot ? (0, artisans_1.getLotStageIds)(lot) : [],
        });
    };
    const startEditArtisan = (artisan) => {
        setSelected(null);
        setFormError(undefined);
        setEditingArtisan({
            id: artisan.id,
            company: artisan.company,
            lotId: (0, artisans_1.getArtisanPrimaryLotId)(artisan, lots) ?? '',
            stageIds: (0, artisans_1.getArtisanStageIds)(artisan, lots),
            contactName: artisan.contactName,
            phone: artisan.phone,
            email: artisan.email,
            code: artisan.code,
            leadTimeDays: String(artisan.leadTimeDays),
            note: artisan.note ?? '',
            orderEmail: artisan.orderEmail ?? artisan.email ?? '',
            conventionLocalFileId: artisan.conventionLocalFileId,
            conventionName: artisan.conventionName,
            conventionMimeType: artisan.conventionMimeType,
        });
    };
    const toggleArtisanStage = (stageId) => {
        if (!editingArtisan)
            return;
        const selectedIds = new Set(editingArtisan.stageIds);
        if (selectedIds.has(stageId))
            selectedIds.delete(stageId);
        else
            selectedIds.add(stageId);
        setEditingArtisan({ ...editingArtisan, stageIds: Array.from(selectedIds) });
    };
    const uploadConvention = async (file) => {
        if (!file || !editingArtisan)
            return;
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setFormError('La convention doit être un fichier PDF.');
            return;
        }
        setUploadingConvention(true);
        setFormError(undefined);
        try {
            const saved = await onUploadConvention(file);
            setEditingArtisan({
                ...editingArtisan,
                conventionLocalFileId: saved.localFileId,
                conventionName: saved.name,
                conventionMimeType: saved.mimeType,
            });
        }
        catch (reason) {
            setFormError(reason instanceof Error ? reason.message : "Impossible d'enregistrer la convention.");
        }
        finally {
            setUploadingConvention(false);
            if (conventionInputRef.current)
                conventionInputRef.current.value = '';
        }
    };
    const saveArtisanForm = async () => {
        if (!editingArtisan)
            return;
        const selectedStages = stages_1.STAGES.filter((stage) => editingArtisan.stageIds.includes(stage.id));
        const selectedLot = sortedLots.find((lot) => lot.id === editingArtisan.lotId);
        if (!editingArtisan.company.trim() || !selectedLot || selectedStages.length === 0) {
            setFormError("L'entreprise, son lot de classement et au moins une étape d'intervention sont obligatoires.");
            return;
        }
        const selectedStageIds = selectedStages.map((stage) => stage.id);
        setSaving(true);
        setFormError(undefined);
        const artisan = {
            id: editingArtisan.id ?? `a-${crypto.randomUUID()}`,
            company: editingArtisan.company.trim(),
            lotId: selectedLot.id,
            lotIds: [selectedLot.id],
            stageIds: selectedStageIds,
            trade: selectedLot.name,
            contactName: editingArtisan.contactName.trim(),
            phone: editingArtisan.phone.trim(),
            email: editingArtisan.email.trim(),
            code: editingArtisan.code.trim().toUpperCase() || editingArtisan.company.trim().slice(0, 8).toUpperCase(),
            leadTimeDays: Math.max(0, Number.parseInt(editingArtisan.leadTimeDays, 10) || 0),
            note: editingArtisan.note.trim() || undefined,
            orderEmail: editingArtisan.orderEmail.trim() || editingArtisan.email.trim() || undefined,
            conventionLocalFileId: editingArtisan.conventionLocalFileId,
            conventionName: editingArtisan.conventionName,
            conventionMimeType: editingArtisan.conventionMimeType,
        };
        try {
            await onSaveArtisan(artisan);
            setEditingArtisan(null);
        }
        catch (reason) {
            setFormError(reason instanceof Error ? reason.message : "Impossible d'enregistrer l'artisan.");
        }
        finally {
            setSaving(false);
        }
    };
    const deleteArtisan = async (artisan) => {
        if (!window.confirm(`Supprimer définitivement l'entreprise « ${artisan.company} » du carnet d'adresses ?`))
            return;
        try {
            await onDeleteArtisan(artisan);
            if (selected?.id === artisan.id)
                setSelected(null);
        }
        catch {
            // Le parent affiche déjà le message d'erreur.
        }
    };
    const selectedStageNames = selected ? (0, artisans_1.getArtisanStageNames)(selected, lots) : [];
    const selectedLotNames = selected ? (0, artisans_1.getArtisanLotNames)(selected, lots) : [];
    const formSelectedStageNames = editingArtisan
        ? stages_1.STAGES.filter((stage) => editingArtisan.stageIds.includes(stage.id)).map((stage) => stage.label)
        : [];
    const lotSelectedStageNames = editingLot
        ? stages_1.STAGES.filter((stage) => editingLot.stageIds.includes(stage.id)).map((stage) => stage.label)
        : [];
    const toggleLotVisibility = (lotId) => {
        setCollapsedLotIds((current) => current.includes(lotId)
            ? current.filter((id) => id !== lotId)
            : [...current, lotId]);
    };
    const renderArtisanRow = (artisan) => ((0, jsx_runtime_1.jsxs)("div", { className: "artisan-compact-row artisan-company-card", children: [(0, jsx_runtime_1.jsxs)("button", { className: "artisan-row-open", onClick: () => setSelected(artisan), children: [(0, jsx_runtime_1.jsx)("span", { className: "artisan-row-avatar", children: artisan.code.slice(0, 2) || artisan.company.slice(0, 2) }), (0, jsx_runtime_1.jsxs)("span", { className: "artisan-row-main", children: [(0, jsx_runtime_1.jsx)("span", { className: "artisan-company-kicker", children: "Entreprise" }), (0, jsx_runtime_1.jsx)("strong", { children: artisan.company }), (0, jsx_runtime_1.jsxs)("small", { children: [artisan.contactName || 'Contact non renseigné', artisan.phone ? ` · ${artisan.phone}` : ''] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "artisan-row-meta", children: [(0, jsx_runtime_1.jsx)("span", { className: "artisan-row-code", children: artisan.code }), (0, jsx_runtime_1.jsxs)("small", { children: [(0, artisans_1.getArtisanStageNames)(artisan, lots).length, " \u00E9tape", (0, artisans_1.getArtisanStageNames)(artisan, lots).length > 1 ? 's' : ''] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "artisan-row-action", children: ["Voir la fiche ", (0, jsx_runtime_1.jsx)("b", { children: "\u203A" })] })] }), (0, jsx_runtime_1.jsxs)("details", { className: "item-menu artisan-row-menu", children: [(0, jsx_runtime_1.jsx)("summary", { "aria-label": `Actions pour ${artisan.company}`, children: "\u2022\u2022\u2022" }), (0, jsx_runtime_1.jsxs)("div", { className: "item-menu-popover align-right", children: [(0, jsx_runtime_1.jsx)("button", { onClick: (event) => { event.currentTarget.closest('details')?.removeAttribute('open'); startEditArtisan(artisan); }, children: "\u00C9diter" }), (0, jsx_runtime_1.jsx)("button", { className: "danger", onClick: (event) => { event.currentTarget.closest('details')?.removeAttribute('open'); void deleteArtisan(artisan); }, children: "Supprimer" })] })] })] }, artisan.id));
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack artisans-v2", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header artisan-page-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Carnet d'adresses" }), (0, jsx_runtime_1.jsx)("h1", { children: "Lots et artisans" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "header-button-group", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: startCreateLot, children: "+ Ajouter un lot" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: () => startCreateArtisan(), children: "+ Ajouter un artisan" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "artisan-summary-grid", children: [(0, jsx_runtime_1.jsxs)("article", { className: "panel artisan-summary-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Lots" }), (0, jsx_runtime_1.jsx)("strong", { children: lots.length })] }), (0, jsx_runtime_1.jsxs)("article", { className: "panel artisan-summary-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprises enregistr\u00E9es" }), (0, jsx_runtime_1.jsx)("strong", { children: artisans.length })] }), (0, jsx_runtime_1.jsxs)("article", { className: "panel artisan-summary-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprises affich\u00E9es" }), (0, jsx_runtime_1.jsx)("strong", { children: displayedArtisanCount })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel artisan-toolbar-v2", children: [(0, jsx_runtime_1.jsxs)("label", { className: "search-field artisan-search-v2", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2315" }), (0, jsx_runtime_1.jsx)("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Rechercher une entreprise, un contact ou une \u00E9tape" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "select-field artisan-filter-v2", children: [(0, jsx_runtime_1.jsx)("span", { children: "Lot" }), (0, jsx_runtime_1.jsxs)("select", { value: lotFilter, onChange: (event) => setLotFilter(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Tous les lots" }), sortedLots.map((lot) => (0, jsx_runtime_1.jsxs)("option", { value: lot.id, children: [String((0, lots_1.getLotOrder)(lot)).padStart(2, '0'), " \u00B7 ", lot.name] }, lot.id))] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "artisan-lot-list", children: [groups.map(({ lot, artisans: lotArtisans }) => {
                        const stageNames = stages_1.STAGES.filter((stage) => (0, artisans_1.getLotStageIds)(lot).includes(stage.id)).map((stage) => stage.label);
                        return ((0, jsx_runtime_1.jsxs)("article", { className: `panel artisan-lot-section ${collapsedLotIds.includes(lot.id) ? 'collapsed' : ''}`, children: [(0, jsx_runtime_1.jsxs)("header", { className: "artisan-lot-header artisan-lot-header-compact", children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-lot-title-wrap", children: [(0, jsx_runtime_1.jsx)("span", { className: "artisan-lot-icon lot-order-icon", children: String((0, lots_1.getLotOrder)(lot)).padStart(2, '0') }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-lot-title-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-lot-title-line", children: [(0, jsx_runtime_1.jsx)("h2", { children: lot.name }), lot.code && (0, jsx_runtime_1.jsx)("span", { className: "artisan-lot-kicker", children: lot.code })] }), (0, jsx_runtime_1.jsx)("p", { children: stageNames.length > 0 ? `${stageNames.length} étape${stageNames.length > 1 ? 's' : ''} liée${stageNames.length > 1 ? 's' : ''}` : 'Aucune étape rattachée' })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-lot-header-actions", children: [(0, jsx_runtime_1.jsxs)("span", { className: "artisan-count-badge", children: [lotArtisans.length, " entreprise", lotArtisans.length > 1 ? 's' : ''] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "artisan-lot-toggle", onClick: () => toggleLotVisibility(lot.id), "aria-expanded": !collapsedLotIds.includes(lot.id), "aria-controls": `artisan-list-${lot.id}`, "aria-label": collapsedLotIds.includes(lot.id) ? `Afficher les artisans du lot ${lot.name}` : `Masquer les artisans du lot ${lot.name}`, children: (0, jsx_runtime_1.jsx)("span", { className: `artisan-collapse-arrow ${collapsedLotIds.includes(lot.id) ? 'collapsed' : ''}`, children: "\u2304" }) }), (0, jsx_runtime_1.jsxs)("details", { className: "item-menu", children: [(0, jsx_runtime_1.jsx)("summary", { "aria-label": `Actions pour le lot ${lot.name}`, children: "\u2022\u2022\u2022" }), (0, jsx_runtime_1.jsxs)("div", { className: "item-menu-popover", children: [(0, jsx_runtime_1.jsx)("button", { onClick: (event) => { event.currentTarget.closest('details')?.removeAttribute('open'); startCreateArtisan(lot.id); }, children: "Ajouter une entreprise" }), (0, jsx_runtime_1.jsx)("button", { onClick: (event) => { event.currentTarget.closest('details')?.removeAttribute('open'); startEditLot(lot); }, children: "\u00C9diter le lot" }), (0, jsx_runtime_1.jsx)("button", { className: "danger", onClick: (event) => { event.currentTarget.closest('details')?.removeAttribute('open'); void deleteLot(lot); }, children: "Supprimer le lot" })] })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { id: `artisan-list-${lot.id}`, className: "artisan-compact-list artisan-company-list", hidden: collapsedLotIds.includes(lot.id), children: [lotArtisans.map(renderArtisanRow), lotArtisans.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "artisan-lot-empty", children: [(0, jsx_runtime_1.jsx)("span", { children: "Aucune entreprise class\u00E9e dans ce lot." }), (0, jsx_runtime_1.jsx)("button", { className: "text-action-button", onClick: () => startCreateArtisan(lot.id), children: "+ Ajouter une entreprise" })] }))] })] }, lot.id));
                    }), unclassifiedArtisans.length > 0 && ((0, jsx_runtime_1.jsxs)("article", { className: "panel artisan-lot-section artisan-lot-unclassified", children: [(0, jsx_runtime_1.jsxs)("header", { className: "artisan-lot-header", children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-lot-title-wrap", children: [(0, jsx_runtime_1.jsx)("span", { className: "artisan-lot-icon", children: "!" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "artisan-lot-kicker", children: "\u00C0 compl\u00E9ter" }), (0, jsx_runtime_1.jsx)("h2", { children: "Entreprises \u00E0 classer" }), (0, jsx_runtime_1.jsx)("p", { children: "Ouvre chaque fiche et choisis son lot principal. Les \u00E9tapes d'intervention ne modifieront plus ce classement." })] })] }), (0, jsx_runtime_1.jsxs)("span", { className: "artisan-count-badge", children: [unclassifiedArtisans.length, " entreprise", unclassifiedArtisans.length > 1 ? 's' : ''] })] }), (0, jsx_runtime_1.jsx)("div", { className: "artisan-compact-list", children: unclassifiedArtisans.map(renderArtisanRow) })] })), groups.length === 0 && unclassifiedArtisans.length === 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "panel artisan-empty-state", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aucun r\u00E9sultat trouv\u00E9" }), (0, jsx_runtime_1.jsx)("span", { children: "Modifie ta recherche ou le filtre s\u00E9lectionn\u00E9." })] }))] }), selected && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: selected.company, onClose: () => setSelected(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-detail-sheet", children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-detail-hero", children: [(0, jsx_runtime_1.jsx)("div", { className: "artisan-avatar-large", children: selected.code.slice(0, 2) || selected.company.slice(0, 2) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("span", { children: [selectedStageNames.length, " \u00E9tape", selectedStageNames.length > 1 ? 's' : '', " d'intervention"] }), (0, jsx_runtime_1.jsx)("h3", { children: selected.company }), (0, jsx_runtime_1.jsx)("p", { children: selected.contactName || 'Contact non renseigné' })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "artisan-lot-chips", "aria-label": "Lots associ\u00E9s", children: selectedLotNames.length > 0
                                    ? selectedLotNames.map((name) => (0, jsx_runtime_1.jsx)("span", { children: name }, name))
                                    : (0, jsx_runtime_1.jsx)("em", { children: "Aucun lot associ\u00E9 automatiquement" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-stage-list", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes du planning" }), (0, jsx_runtime_1.jsx)("div", { children: selectedStageNames.map((name) => (0, jsx_runtime_1.jsx)("span", { children: name }, name)) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-detail-grid", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E9l\u00E9phone" }), selected.phone ? (0, jsx_runtime_1.jsx)("a", { href: `tel:${selected.phone.replaceAll(' ', '')}`, children: selected.phone }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail" }), selected.email ? (0, jsx_runtime_1.jsx)("a", { href: `mailto:${selected.email}`, children: selected.email }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail commandes" }), selected.orderEmail ? (0, jsx_runtime_1.jsx)("a", { href: `mailto:${selected.orderEmail}`, children: selected.orderEmail }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Convention" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.conventionName || 'Non ajoutée' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Code planning" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.code || '—' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "D\u00E9lai de pr\u00E9venance" }), (0, jsx_runtime_1.jsxs)("strong", { children: [selected.leadTimeDays, " jour", selected.leadTimeDays > 1 ? 's' : ''] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-detail-note", children: [(0, jsx_runtime_1.jsx)("span", { children: "Notes" }), (0, jsx_runtime_1.jsx)("p", { children: selected.note || 'Aucune note particulière.' })] })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "danger-outline-button", onClick: () => void deleteArtisan(selected), children: "Supprimer" }), (0, jsx_runtime_1.jsx)("span", { className: "modal-action-spacer" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setSelected(null), children: "Fermer" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: () => startEditArtisan(selected), children: "Modifier la fiche" })] })] })), editingLot && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: editingLot.id ? 'Modifier le lot' : 'Ajouter un lot', onClose: () => setEditingLot(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-grid artisan-form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du lot *" }), (0, jsx_runtime_1.jsx)("input", { value: editingLot.name, onChange: (event) => setEditingLot({ ...editingLot, name: event.target.value }), placeholder: "Ex. VRD" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Code" }), (0, jsx_runtime_1.jsx)("input", { value: editingLot.code, onChange: (event) => setEditingLot({ ...editingLot, code: event.target.value }), placeholder: "Ex. VRD" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "full-field artisan-multiselect-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes rattach\u00E9es au lot" }), (0, jsx_runtime_1.jsxs)("details", { className: "lot-multiselect", children: [(0, jsx_runtime_1.jsxs)("summary", { children: [(0, jsx_runtime_1.jsx)("span", { children: lotSelectedStageNames.length > 0 ? lotSelectedStageNames.join(', ') : 'Sélectionner les étapes concernées' }), (0, jsx_runtime_1.jsx)("b", { children: lotSelectedStageNames.length > 0 ? `${lotSelectedStageNames.length} sélectionnée${lotSelectedStageNames.length > 1 ? 's' : ''}` : '⌄' })] }), (0, jsx_runtime_1.jsx)("div", { className: "lot-multiselect-popover stage-multiselect-popover", children: stages_1.STAGES.map((stage, index) => ((0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: editingLot.stageIds.includes(stage.id), onChange: () => toggleLotStage(stage.id) }), (0, jsx_runtime_1.jsxs)("span", { children: [String(index + 1).padStart(2, '0'), " \u00B7 ", stage.label] })] }, stage.id))) })] }), (0, jsx_runtime_1.jsx)("small", { className: "field-help", children: "Ces \u00E9tapes seront pr\u00E9coch\u00E9es quand tu ajoutes une entreprise depuis ce lot. Elles ne changent jamais son classement." })] })] }), lotFormError && (0, jsx_runtime_1.jsx)("p", { className: "artisan-form-error", children: lotFormError }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setEditingLot(null), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: savingLot, onClick: saveLotForm, children: savingLot ? 'Enregistrement…' : 'Enregistrer' })] })] })), editingArtisan && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: editingArtisan.id ? "Modifier l'entreprise" : 'Ajouter une entreprise', onClose: () => setEditingArtisan(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-grid artisan-form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Lot de classement *" }), (0, jsx_runtime_1.jsxs)("select", { value: editingArtisan.lotId, onChange: (event) => setEditingArtisan({ ...editingArtisan, lotId: event.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Choisir le m\u00E9tier principal" }), sortedLots.map((lot) => (0, jsx_runtime_1.jsxs)("option", { value: lot.id, children: [String((0, lots_1.getLotOrder)(lot)).padStart(2, '0'), " \u00B7 ", lot.name] }, lot.id))] }), (0, jsx_runtime_1.jsx)("small", { className: "field-help", children: "L'entreprise restera rang\u00E9e dans ce lot, quelles que soient les \u00E9tapes coch\u00E9es ensuite." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "full-field artisan-multiselect-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes d'intervention *" }), (0, jsx_runtime_1.jsxs)("details", { className: "lot-multiselect", children: [(0, jsx_runtime_1.jsxs)("summary", { children: [(0, jsx_runtime_1.jsx)("span", { children: formSelectedStageNames.length > 0 ? formSelectedStageNames.join(', ') : 'Sélectionner une ou plusieurs étapes du planning' }), (0, jsx_runtime_1.jsx)("b", { children: formSelectedStageNames.length > 0 ? `${formSelectedStageNames.length} sélectionnée${formSelectedStageNames.length > 1 ? 's' : ''}` : '⌄' })] }), (0, jsx_runtime_1.jsx)("div", { className: "lot-multiselect-popover stage-multiselect-popover", children: stages_1.STAGES.map((stage, index) => ((0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: editingArtisan.stageIds.includes(stage.id), onChange: () => toggleArtisanStage(stage.id) }), (0, jsx_runtime_1.jsxs)("span", { children: [String(index + 1).padStart(2, '0'), " \u00B7 ", stage.label] })] }, stage.id))) })] }), (0, jsx_runtime_1.jsx)("small", { className: "field-help", children: "Dans le planning, cette entreprise sera propos\u00E9e uniquement dans les colonnes coch\u00E9es ici." })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprise *" }), (0, jsx_runtime_1.jsx)("input", { value: editingArtisan.company, onChange: (event) => setEditingArtisan({ ...editingArtisan, company: event.target.value }), placeholder: "Nom de l'entreprise" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du contact" }), (0, jsx_runtime_1.jsx)("input", { value: editingArtisan.contactName, onChange: (event) => setEditingArtisan({ ...editingArtisan, contactName: event.target.value }), placeholder: "Pr\u00E9nom Nom" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Code planning" }), (0, jsx_runtime_1.jsx)("input", { value: editingArtisan.code, onChange: (event) => setEditingArtisan({ ...editingArtisan, code: event.target.value }), placeholder: "Ex. BAT87" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E9l\u00E9phone" }), (0, jsx_runtime_1.jsx)("input", { type: "tel", value: editingArtisan.phone, onChange: (event) => setEditingArtisan({ ...editingArtisan, phone: event.target.value }), placeholder: "06 00 00 00 00" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: editingArtisan.email, onChange: (event) => setEditingArtisan({ ...editingArtisan, email: event.target.value }), placeholder: "contact@entreprise.fr" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail pour les commandes" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: editingArtisan.orderEmail, onChange: (event) => setEditingArtisan({ ...editingArtisan, orderEmail: event.target.value }), placeholder: "commandes@entreprise.fr" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field convention-upload-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Convention de l'entreprise" }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary-button", onClick: () => conventionInputRef.current?.click(), disabled: uploadingConvention, children: uploadingConvention ? 'Import en cours…' : editingArtisan.conventionName ? `Remplacer : ${editingArtisan.conventionName}` : '+ Ajouter la convention' }), (0, jsx_runtime_1.jsx)("input", { ref: conventionInputRef, type: "file", accept: ".pdf,application/pdf", hidden: true, onChange: (event) => void uploadConvention(event.target.files?.[0]) }), editingArtisan.conventionName ? (0, jsx_runtime_1.jsxs)("small", { className: "field-help", children: ["PDF enregistr\u00E9 : ", editingArtisan.conventionName, ". Il sera ajout\u00E9 automatiquement aux commandes de cette entreprise."] }) : (0, jsx_runtime_1.jsx)("small", { className: "field-help", children: "Ajoute le PDF une seule fois : il sera repris automatiquement dans l\u2019onglet Commandes." })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "D\u00E9lai de pr\u00E9venance" }), (0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", value: editingArtisan.leadTimeDays, onChange: (event) => setEditingArtisan({ ...editingArtisan, leadTimeDays: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Notes" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: editingArtisan.note, onChange: (event) => setEditingArtisan({ ...editingArtisan, note: event.target.value }), placeholder: "Disponibilit\u00E9s, zone d'intervention, habitudes, remarques\u2026" })] })] }), formError && (0, jsx_runtime_1.jsx)("p", { className: "artisan-form-error", children: formError }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setEditingArtisan(null), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: saving, onClick: saveArtisanForm, children: saving ? 'Enregistrement…' : 'Enregistrer' })] })] }))] }));
}

},
"src/components/AuthScreen": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthScreen = AuthScreen;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const auth_1 = require("../lib/auth");
const cleanStart_1 = require("../lib/cleanStart");
function AuthScreen({ onAuthenticated }) {
    const [mode, setMode] = (0, react_1.useState)('login');
    const [email, setEmail] = (0, react_1.useState)('');
    const [name, setName] = (0, react_1.useState)('');
    const [password, setPassword] = (0, react_1.useState)('');
    const [confirm, setConfirm] = (0, react_1.useState)('');
    const [error, setError] = (0, react_1.useState)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const submit = async () => {
        setError(undefined);
        setLoading(true);
        try {
            if (mode === 'register') {
                if (password !== confirm)
                    throw new Error('Les deux mots de passe ne correspondent pas.');
                const user = await (0, auth_1.createLocalAccount)(email, password, name);
                onAuthenticated(user);
            }
            else {
                const user = await (0, auth_1.loginLocalAccount)(email, password);
                onAuthenticated(user);
            }
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Connexion impossible.');
        }
        finally {
            setLoading(false);
        }
    };
    return ((0, jsx_runtime_1.jsx)("main", { className: "auth-page", children: (0, jsx_runtime_1.jsxs)("section", { className: "auth-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "auth-brand", children: [(0, jsx_runtime_1.jsx)("div", { className: "auth-logo-wrap", children: (0, jsx_runtime_1.jsx)("img", { src: "./logo-arlogis.png", alt: "Maisons ARLOGIS" }) }), (0, jsx_runtime_1.jsx)("span", { children: "Conduct'Home" }), (0, jsx_runtime_1.jsx)("h1", { children: mode === 'login' ? 'Connexion' : 'Création du compte' }), (0, jsx_runtime_1.jsx)("small", { children: mode === 'login' ? 'Accède à ton espace existant' : 'Crée ton espace personnel' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "auth-warning success", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Espace s\u00E9curis\u00E9" }), (0, jsx_runtime_1.jsx)("span", { children: "Tes donn\u00E9es sont enregistr\u00E9es et accessibles depuis tes appareils." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "auth-mode-tabs", children: [(0, jsx_runtime_1.jsx)("button", { className: mode === 'login' ? 'active' : '', onClick: () => { setError(undefined); setMode('login'); }, children: "Connexion" }), (0, jsx_runtime_1.jsx)("button", { className: mode === 'register' ? 'active' : '', onClick: () => { setError(undefined); setMode('register'); }, children: "Cr\u00E9er un compte" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "auth-form", "data-lpignore": "true", children: [mode === 'register' && ((0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom affich\u00E9" }), (0, jsx_runtime_1.jsx)("input", { value: name, onChange: (event) => setName(event.target.value), placeholder: "Ex. Simon" })] })), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse e-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: email, onChange: (event) => setEmail(event.target.value), placeholder: "nom@email.fr", autoComplete: "off", name: "conducthome-email" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Mot de passe" }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: password, onChange: (event) => setPassword(event.target.value), placeholder: "Minimum 6 caract\u00E8res", autoComplete: mode === 'login' ? 'current-password' : 'new-password' })] }), mode === 'register' && ((0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Confirmer le mot de passe" }), (0, jsx_runtime_1.jsx)("input", { type: "password", value: confirm, onChange: (event) => setConfirm(event.target.value), placeholder: "R\u00E9p\u00E8te le mot de passe", autoComplete: "new-password" })] })), error && (0, jsx_runtime_1.jsx)("div", { className: "auth-error", children: error }), (0, jsx_runtime_1.jsx)("button", { className: "auth-submit", onClick: submit, disabled: loading, children: loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte' })] }), (0, jsx_runtime_1.jsx)("button", { className: "auth-switch", onClick: () => { setError(undefined); setMode(mode === 'login' ? 'register' : 'login'); }, children: mode === 'login' ? 'Pas encore de compte ? Passer à la création' : 'Compte déjà créé ? Revenir à la connexion' }), (0, jsx_runtime_1.jsx)("button", { className: "auth-reset-device", onClick: () => void (0, cleanStart_1.resetConductHomeNow)(), children: "R\u00E9initialiser compl\u00E8tement cet appareil" })] }) }));
}

},
"src/components/CalendarView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarView = CalendarView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const Modal_1 = require("./Modal");
const calendar_1 = require("../lib/calendar");
const hours = Array.from({ length: calendar_1.CALENDAR_END_HOUR - calendar_1.CALENDAR_START_HOUR + 1 }, (_, index) => calendar_1.CALENDAR_START_HOUR + index);
const calendarHeight = (calendar_1.CALENDAR_END_HOUR - calendar_1.CALENDAR_START_HOUR) * calendar_1.CALENDAR_HOUR_HEIGHT;
function makeDraft(date) {
    const times = (0, calendar_1.defaultCalendarTimes)();
    return { projectId: '', date, startTime: times.startTime, endTime: times.endTime, note: '' };
}
function CalendarView({ projects, events, onSaveEvent, onDeleteEvent }) {
    const [weekOffset, setWeekOffset] = (0, react_1.useState)(0);
    const [draft, setDraft] = (0, react_1.useState)();
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)();
    const weekStart = (0, react_1.useMemo)(() => {
        const monday = (0, calendar_1.startOfIsoWeek)();
        monday.setDate(monday.getDate() + weekOffset * 7);
        return monday;
    }, [weekOffset]);
    const days = (0, react_1.useMemo)(() => Array.from({ length: 5 }, (_, index) => (0, calendar_1.addDays)(weekStart, index)), [weekStart]);
    const dayIds = (0, react_1.useMemo)(() => days.map(calendar_1.localDateId), [days]);
    const todayId = (0, calendar_1.localDateId)();
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const currentTimeTop = ((currentMinutes - calendar_1.CALENDAR_START_HOUR * 60) / 60) * calendar_1.CALENDAR_HOUR_HEIGHT;
    const openNewEvent = () => {
        const preferredDate = dayIds.includes(todayId) ? todayId : dayIds[0];
        setError(undefined);
        setDraft(makeDraft(preferredDate));
    };
    const openEvent = (event) => {
        setError(undefined);
        setDraft({
            id: event.id,
            projectId: event.projectId || '',
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            note: event.note,
            createdAt: event.createdAt,
        });
    };
    const saveEvent = async () => {
        if (!draft)
            return;
        if (!draft.date || !draft.startTime || !draft.endTime || !draft.note.trim()) {
            setError('La date, les horaires et la raison du rendez-vous sont obligatoires.');
            return;
        }
        const start = (0, calendar_1.timeToMinutes)(draft.startTime);
        const end = (0, calendar_1.timeToMinutes)(draft.endTime);
        if (start < calendar_1.CALENDAR_START_HOUR * 60 || end > calendar_1.CALENDAR_END_HOUR * 60 || end <= start) {
            setError('Le rendez-vous doit être compris entre 6 h et 20 h, avec une heure de fin après le début.');
            return;
        }
        setSaving(true);
        const timestamp = new Date().toISOString();
        try {
            await onSaveEvent({
                id: draft.id || `calendar-${crypto.randomUUID()}`,
                projectId: draft.projectId || undefined,
                date: draft.date,
                startTime: draft.startTime,
                endTime: draft.endTime,
                note: draft.note.trim(),
                createdAt: draft.createdAt || timestamp,
                updatedAt: timestamp,
            });
            setDraft(undefined);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Enregistrement du rendez-vous impossible.');
        }
        finally {
            setSaving(false);
        }
    };
    const deleteEvent = async () => {
        if (!draft?.id)
            return;
        const event = events.find((item) => item.id === draft.id);
        if (!event || !window.confirm('Supprimer ce rendez-vous du calendrier ?'))
            return;
        setSaving(true);
        try {
            await onDeleteEvent(event);
            setDraft(undefined);
        }
        catch (reason) {
            setError(reason instanceof Error ? reason.message : 'Suppression du rendez-vous impossible.');
        }
        finally {
            setSaving(false);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack calendar-view", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header calendar-page-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Rendez-vous et organisation" }), (0, jsx_runtime_1.jsx)("h1", { children: "Calendrier" }), (0, jsx_runtime_1.jsxs)("p", { children: ["Semaine ", (0, calendar_1.getIsoWeek)(weekStart), " \u00B7 ", (0, calendar_1.formatCalendarRange)(days[0], days[4])] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "calendar-header-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setWeekOffset((value) => value - 1), children: "\u2190 Pr\u00E9c\u00E9dente" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setWeekOffset(0), children: "Aujourd\u2019hui" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setWeekOffset((value) => value + 1), children: "Suivante \u2192" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: openNewEvent, children: "+ Ajouter un \u00E9v\u00E9nement" })] })] }), (0, jsx_runtime_1.jsx)("section", { className: "calendar-panel panel", children: (0, jsx_runtime_1.jsx)("div", { className: "calendar-scroll", children: (0, jsx_runtime_1.jsxs)("div", { className: "calendar-week-grid", children: [(0, jsx_runtime_1.jsx)("div", { className: "calendar-corner", children: (0, jsx_runtime_1.jsx)("span", { children: "Heure" }) }), days.map((day) => {
                                const dateId = (0, calendar_1.localDateId)(day);
                                const count = events.filter((event) => event.date === dateId).length;
                                return ((0, jsx_runtime_1.jsxs)("header", { className: `calendar-day-header${dateId === todayId ? ' today' : ''}`, children: [(0, jsx_runtime_1.jsx)("span", { children: (0, calendar_1.formatCalendarDay)(day) }), (0, jsx_runtime_1.jsx)("strong", { children: count })] }, dateId));
                            }), (0, jsx_runtime_1.jsx)("div", { className: "calendar-time-axis", style: { height: `${calendarHeight}px` }, children: hours.map((hour, index) => ((0, jsx_runtime_1.jsxs)("span", { style: { top: `${index * calendar_1.CALENDAR_HOUR_HEIGHT}px` }, children: [String(hour).padStart(2, '0'), ":00"] }, hour))) }), days.map((day) => {
                                const dateId = (0, calendar_1.localDateId)(day);
                                const dayEvents = events
                                    .filter((event) => event.date === dateId)
                                    .slice()
                                    .sort((left, right) => left.startTime.localeCompare(right.startTime));
                                const showCurrentTime = dateId === todayId && currentMinutes >= calendar_1.CALENDAR_START_HOUR * 60 && currentMinutes <= calendar_1.CALENDAR_END_HOUR * 60;
                                return ((0, jsx_runtime_1.jsxs)("div", { className: `calendar-day-column${dateId === todayId ? ' today' : ''}`, style: { height: `${calendarHeight}px` }, children: [hours.slice(0, -1).map((hour, index) => (0, jsx_runtime_1.jsx)("i", { className: "calendar-hour-line", style: { top: `${index * calendar_1.CALENDAR_HOUR_HEIGHT}px` } }, hour)), showCurrentTime && (0, jsx_runtime_1.jsx)("div", { className: "calendar-current-time", style: { top: `${currentTimeTop}px` }, children: (0, jsx_runtime_1.jsx)("span", {}) }), dayEvents.map((event, index) => {
                                            const project = projects.find((item) => item.id === event.projectId);
                                            const geometry = (0, calendar_1.getCalendarEventGeometry)(event);
                                            return ((0, jsx_runtime_1.jsxs)("button", { className: "calendar-event-card", style: { top: `${geometry.top}px`, height: `${geometry.height}px`, left: `${6 + (index % 2) * 3}px`, right: `${6 - (index % 2) * 3}px` }, onClick: () => openEvent(event), title: `${event.startTime} - ${event.endTime} · ${event.note}`, children: [(0, jsx_runtime_1.jsxs)("span", { children: [event.startTime, " - ", event.endTime] }), (0, jsx_runtime_1.jsx)("strong", { children: project?.name || 'Rendez-vous général' }), (0, jsx_runtime_1.jsx)("small", { children: event.note })] }, event.id));
                                        })] }, dateId));
                            })] }) }) }), draft && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: draft.id ? 'Modifier le rendez-vous' : 'Ajouter un rendez-vous', onClose: () => setDraft(undefined), children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-grid calendar-event-form", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantier concern\u00E9" }), (0, jsx_runtime_1.jsxs)("select", { value: draft.projectId, onChange: (event) => setDraft({ ...draft, projectId: event.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Rendez-vous g\u00E9n\u00E9ral" }), projects.map((project) => (0, jsx_runtime_1.jsxs)("option", { value: project.id, children: [project.name, " \u2014 ", project.city] }, project.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date *" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: draft.date, onChange: (event) => setDraft({ ...draft, date: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "D\u00E9but *" }), (0, jsx_runtime_1.jsx)("input", { type: "time", min: "06:00", max: "19:30", step: "900", value: draft.startTime, onChange: (event) => setDraft({ ...draft, startTime: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Fin *" }), (0, jsx_runtime_1.jsx)("input", { type: "time", min: "06:30", max: "20:00", step: "900", value: draft.endTime, onChange: (event) => setDraft({ ...draft, endTime: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Raison / note *" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 5, value: draft.note, onChange: (event) => setDraft({ ...draft, note: event.target.value }), placeholder: "Ex. R\u00E9union de mise au point avec le client, contr\u00F4le avant coulage\u2026" })] })] }), error && (0, jsx_runtime_1.jsx)("p", { className: "calendar-form-error", children: error }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions calendar-modal-actions", children: [draft.id && (0, jsx_runtime_1.jsx)("button", { className: "danger-outline-button", disabled: saving, onClick: () => void deleteEvent(), children: "Supprimer" }), (0, jsx_runtime_1.jsx)("span", {}), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", disabled: saving, onClick: () => setDraft(undefined), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: saving, onClick: () => void saveEvent(), children: saving ? 'Enregistrement…' : 'Enregistrer' })] })] }))] }));
}

},
"src/components/Dashboard": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Dashboard = Dashboard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const stages_1 = require("../data/stages");
const planning_1 = require("../lib/planning");
const calendar_1 = require("../lib/calendar");
const priorityRank = { urgent: 0, high: 1, normal: 2 };
const miniHours = Array.from({ length: calendar_1.CALENDAR_END_HOUR - calendar_1.CALENDAR_START_HOUR + 1 }, (_, index) => calendar_1.CALENDAR_START_HOUR + index);
const miniCalendarHeight = (calendar_1.CALENDAR_END_HOUR - calendar_1.CALENDAR_START_HOUR) * calendar_1.MINI_CALENDAR_HOUR_HEIGHT;
function sortTasks(a, b) {
    const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDifference !== 0)
        return priorityDifference;
    if (a.dueDate && b.dueDate)
        return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate)
        return -1;
    if (b.dueDate)
        return 1;
    return b.createdAt.localeCompare(a.createdAt);
}
function formatTaskDate(value) {
    if (!value)
        return 'Sans échéance';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`));
}
function Dashboard({ projects, notifications, tasks, calendarEvents, onOpenPlanning, onOpenWeek, onOpenCalendar, onOpenProject, onOpenTasks, onCompleteTask }) {
    const [completingIds, setCompletingIds] = (0, react_1.useState)([]);
    const late = projects.filter(planning_1.isProjectLate).length;
    const activeTasks = tasks.filter((task) => !task.completedAt).sort(sortTasks);
    const today = new Date();
    const todayId = (0, calendar_1.localDateId)(today);
    const todayEvents = calendarEvents.filter((event) => event.date === todayId).slice().sort((left, right) => left.startTime.localeCompare(right.startTime));
    const currentMinutes = today.getHours() * 60 + today.getMinutes();
    const currentTimeTop = ((currentMinutes - calendar_1.CALENDAR_START_HOUR * 60) / 60) * calendar_1.MINI_CALENDAR_HOUR_HEIGHT;
    const showCurrentTime = currentMinutes >= calendar_1.CALENDAR_START_HOUR * 60 && currentMinutes <= calendar_1.CALENDAR_END_HOUR * 60;
    const dayNumber = new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(today);
    const dayName = new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(today);
    const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(today);
    const completeTask = (task) => {
        if (completingIds.includes(task.id))
            return;
        setCompletingIds((current) => [...current, task.id]);
        window.setTimeout(async () => {
            try {
                await onCompleteTask(task);
            }
            finally {
                setCompletingIds((current) => current.filter((id) => id !== task.id));
            }
        }, 680);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header dashboard-home-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "dashboard-home-heading", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Vue g\u00E9n\u00E9rale" }), (0, jsx_runtime_1.jsx)("h1", { children: "Tableau de bord" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-header-actions", children: [(0, jsx_runtime_1.jsxs)("button", { className: "week-number-pill", onClick: onOpenWeek, children: [(0, jsx_runtime_1.jsx)("span", { children: "Semaine actuelle" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, calendar_1.getIsoWeek)() })] }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: onOpenPlanning, children: "Ouvrir le planning" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "kpi-grid", children: [(0, jsx_runtime_1.jsxs)("article", { className: "kpi-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantiers actifs" }), (0, jsx_runtime_1.jsx)("strong", { children: projects.length }), (0, jsx_runtime_1.jsxs)("small", { children: [projects.filter((project) => !(0, planning_1.isProjectLate)(project)).length, " dans les temps"] })] }), (0, jsx_runtime_1.jsxs)("article", { className: "kpi-card task-soft", children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E2ches \u00E0 faire" }), (0, jsx_runtime_1.jsx)("strong", { children: activeTasks.length }), (0, jsx_runtime_1.jsxs)("small", { children: [activeTasks.filter((task) => task.priority === 'urgent').length, " urgente(s)"] })] }), (0, jsx_runtime_1.jsxs)("article", { className: "kpi-card danger-soft", children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantiers en retard" }), (0, jsx_runtime_1.jsx)("strong", { children: late }), (0, jsx_runtime_1.jsx)("small", { children: "\u00C0 traiter en priorit\u00E9" })] }), (0, jsx_runtime_1.jsxs)("article", { className: "kpi-card warning-soft", children: [(0, jsx_runtime_1.jsx)("span", { children: "Alertes \u00E0 venir" }), (0, jsx_runtime_1.jsx)("strong", { children: notifications.length }), (0, jsx_runtime_1.jsx)("small", { children: "Artisans \u00E0 pr\u00E9venir" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "dashboard-focus-grid", children: [(0, jsx_runtime_1.jsxs)("section", { className: "panel dashboard-tasks-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Prioritaire" }), (0, jsx_runtime_1.jsx)("h2", { children: "Mes t\u00E2ches" })] }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: onOpenTasks, children: "G\u00E9rer toutes les t\u00E2ches" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-task-list", children: [!activeTasks.length && ((0, jsx_runtime_1.jsxs)("button", { className: "dashboard-task-empty", onClick: onOpenTasks, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2713" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aucune t\u00E2che en attente." }), (0, jsx_runtime_1.jsx)("small", { children: "Cliquer ici pour en ajouter une." })] })] })), activeTasks.slice(0, 6).map((task) => {
                                        const project = projects.find((item) => item.id === task.projectId);
                                        const completing = completingIds.includes(task.id);
                                        return ((0, jsx_runtime_1.jsxs)("article", { className: `dashboard-task-row priority-${task.priority}${completing ? ' completing' : ''}`, children: [(0, jsx_runtime_1.jsx)("button", { className: "task-check", onClick: () => completeTask(task), "aria-label": `Terminer ${task.title}`, children: (0, jsx_runtime_1.jsx)("span", { children: "\u2713" }) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: task.title }), (0, jsx_runtime_1.jsxs)("small", { children: [project ? `${project.name} · ` : '', formatTaskDate(task.dueDate)] })] }), task.priority !== 'normal' && (0, jsx_runtime_1.jsx)("span", { className: `task-priority ${task.priority}`, children: task.priority === 'urgent' ? 'Urgente' : 'Importante' })] }, task.id));
                                    }), activeTasks.length > 6 && (0, jsx_runtime_1.jsxs)("button", { className: "dashboard-task-more", onClick: onOpenTasks, children: ["+ ", activeTasks.length - 6, " autre(s) t\u00E2che(s)"] })] })] }), (0, jsx_runtime_1.jsxs)("aside", { className: "panel dashboard-day-agenda", children: [(0, jsx_runtime_1.jsxs)("header", { className: "dashboard-day-header", children: [(0, jsx_runtime_1.jsx)("div", { className: "dashboard-day-number", children: dayNumber }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Aujourd\u2019hui" }), (0, jsx_runtime_1.jsx)("strong", { children: dayName }), (0, jsx_runtime_1.jsx)("small", { children: monthName })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onOpenCalendar, "aria-label": "Ouvrir le calendrier", children: "\u2192" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-mini-calendar", onClick: onOpenCalendar, role: "button", tabIndex: 0, children: [(0, jsx_runtime_1.jsx)("div", { className: "dashboard-mini-time-axis", style: { height: `${miniCalendarHeight}px` }, children: miniHours.map((hour, index) => (0, jsx_runtime_1.jsxs)("span", { style: { top: `${index * calendar_1.MINI_CALENDAR_HOUR_HEIGHT}px` }, children: [String(hour).padStart(2, '0'), "h"] }, hour)) }), (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-mini-day", style: { height: `${miniCalendarHeight}px` }, children: [miniHours.slice(0, -1).map((hour, index) => (0, jsx_runtime_1.jsx)("i", { style: { top: `${index * calendar_1.MINI_CALENDAR_HOUR_HEIGHT}px` } }, hour)), showCurrentTime && (0, jsx_runtime_1.jsx)("div", { className: "dashboard-current-time", style: { top: `${currentTimeTop}px` }, children: (0, jsx_runtime_1.jsx)("span", {}) }), todayEvents.map((event) => {
                                                const project = projects.find((item) => item.id === event.projectId);
                                                const geometry = (0, calendar_1.getCalendarEventGeometry)(event, calendar_1.MINI_CALENDAR_HOUR_HEIGHT);
                                                return ((0, jsx_runtime_1.jsxs)("article", { className: "dashboard-mini-event", style: { top: `${geometry.top}px`, height: `${geometry.height}px` }, title: `${event.startTime} - ${event.endTime} · ${event.note}`, children: [(0, jsx_runtime_1.jsx)("strong", { children: project?.name || 'Rendez-vous' }), (0, jsx_runtime_1.jsxs)("small", { children: [event.startTime, " \u00B7 ", event.note] })] }, event.id));
                                            }), !todayEvents.length && (0, jsx_runtime_1.jsxs)("div", { className: "dashboard-no-event", children: [(0, jsx_runtime_1.jsx)("span", { children: "Aucun rendez-vous aujourd\u2019hui" }), (0, jsx_runtime_1.jsx)("small", { children: "Cliquer pour ouvrir le calendrier" })] })] })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "dashboard-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel project-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Portefeuille" }), (0, jsx_runtime_1.jsx)("h2", { children: "Avancement des chantiers" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [stages_1.STAGES.length, " \u00E9tapes par trame"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "project-progress-list", children: [!projects.length && ((0, jsx_runtime_1.jsxs)("div", { className: "empty-state", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aucun chantier enregistr\u00E9." }), (0, jsx_runtime_1.jsx)("span", { children: "Cr\u00E9e ton premier dossier depuis le planning ou l\u2019onglet Chantiers." })] })), projects.map((project) => {
                                        const progress = (0, planning_1.getProgress)(project);
                                        const current = (0, planning_1.getCurrentStage)(project);
                                        const next = (0, planning_1.getNextStage)(project);
                                        const effectiveStatus = (0, planning_1.isProjectLate)(project) ? 'late' : project.status;
                                        return ((0, jsx_runtime_1.jsxs)("button", { className: "project-progress-row", onClick: () => onOpenProject(project.id), children: [(0, jsx_runtime_1.jsxs)("div", { className: "project-progress-main", children: [(0, jsx_runtime_1.jsxs)("div", { className: "project-title-line", children: [(0, jsx_runtime_1.jsx)("strong", { children: project.name }), (0, jsx_runtime_1.jsx)("span", { children: project.city }), (0, jsx_runtime_1.jsx)("span", { className: `status-pill ${effectiveStatus}`, children: effectiveStatus === 'late' ? 'En retard' : effectiveStatus === 'warning' ? 'À surveiller' : 'Dans les temps' })] }), (0, jsx_runtime_1.jsx)("div", { className: "progress-track", children: (0, jsx_runtime_1.jsx)("span", { style: { width: `${progress}%` } }) }), (0, jsx_runtime_1.jsxs)("div", { className: "stage-summary", children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("b", { children: "En cours :" }), " ", (0, planning_1.getStageLabel)(current?.stageId)] }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("b", { children: "Ensuite :" }), " ", (0, planning_1.getStageLabel)(next?.stageId)] })] })] }), (0, jsx_runtime_1.jsxs)("strong", { className: "progress-number", children: [progress, "%"] })] }, project.id));
                                    })] })] }), (0, jsx_runtime_1.jsxs)("aside", { className: "panel alert-panel", children: [(0, jsx_runtime_1.jsx)("div", { className: "panel-header", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "\u00C0 faire" }), (0, jsx_runtime_1.jsx)("h2", { children: "Prochaines alertes" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "compact-alerts", children: [notifications.slice(0, 6).map((notification) => ((0, jsx_runtime_1.jsxs)("article", { className: `compact-alert ${notification.severity}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "alert-date", children: (0, planning_1.formatShortDate)(notification.dueDate) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: notification.projectName }), (0, jsx_runtime_1.jsx)("p", { children: notification.title })] })] }, notification.id))), !notifications.length && (0, jsx_runtime_1.jsx)("p", { className: "empty-state", children: "Aucune alerte imm\u00E9diate." })] })] })] })] }));
}

},
"src/components/DocumentsView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentsView = DocumentsView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const planning_1 = require("../lib/planning");
const categories = ['Plans', 'Choix clients', 'Commandes', 'Administratif'];
const categoryOrder = new Map(categories.map((item, index) => [item, index]));
const naturalCollator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
const getFileLabel = (name) => {
    const extension = name.split('.').pop()?.toUpperCase();
    if (!extension || extension.length > 5)
        return 'FIC';
    return extension;
};
const sortDocuments = (left, right) => {
    const categoryDifference = (categoryOrder.get(left.category) ?? 999) - (categoryOrder.get(right.category) ?? 999);
    if (categoryDifference !== 0)
        return categoryDifference;
    return naturalCollator.compare(left.name, right.name);
};
function DocumentsView({ projects, documents, onUpload, onOpenDocument, onMoveDocument, onDeleteDocument }) {
    const [projectId, setProjectId] = (0, react_1.useState)(projects[0]?.id ?? '');
    const [category, setCategory] = (0, react_1.useState)('Plans');
    const [categoryFilter, setCategoryFilter] = (0, react_1.useState)('Tous');
    const [uploading, setUploading] = (0, react_1.useState)(false);
    const [openingId, setOpeningId] = (0, react_1.useState)();
    const [draggingId, setDraggingId] = (0, react_1.useState)();
    const [dropCategory, setDropCategory] = (0, react_1.useState)();
    const [movingId, setMovingId] = (0, react_1.useState)();
    const [deletingId, setDeletingId] = (0, react_1.useState)();
    const inputRef = (0, react_1.useRef)(null);
    const projectDocuments = (0, react_1.useMemo)(() => documents.filter((item) => !projectId || item.projectId === projectId).sort(sortDocuments), [documents, projectId]);
    const displayed = (0, react_1.useMemo)(() => projectDocuments.filter((item) => categoryFilter === 'Tous' || item.category === categoryFilter), [projectDocuments, categoryFilter]);
    const chooseFiles = async (fileList) => {
        const files = Array.from(fileList ?? []);
        if (!files.length || !projectId)
            return;
        setUploading(true);
        try {
            for (const file of files) {
                await onUpload(file, projectId, category);
            }
            setCategoryFilter(category);
        }
        finally {
            setUploading(false);
            if (inputRef.current)
                inputRef.current.value = '';
        }
    };
    const openDocument = async (document) => {
        setOpeningId(document.id);
        try {
            await onOpenDocument(document);
        }
        finally {
            setOpeningId(undefined);
        }
    };
    const deleteDocument = async (document) => {
        const confirmed = window.confirm(`Êtes-vous sûr de bien vouloir supprimer le document « ${document.name} » ?\n\nCette action est définitive.`);
        if (!confirmed)
            return;
        setDeletingId(document.id);
        try {
            await onDeleteDocument(document);
        }
        finally {
            setDeletingId(undefined);
        }
    };
    const moveDocument = async (documentId, targetCategory) => {
        const document = documents.find((item) => item.id === documentId);
        if (!document || document.category === targetCategory) {
            setDraggingId(undefined);
            setDropCategory(undefined);
            return;
        }
        setMovingId(document.id);
        try {
            await onMoveDocument(document, targetCategory);
            setCategory(targetCategory);
            setCategoryFilter(targetCategory);
        }
        finally {
            setMovingId(undefined);
            setDraggingId(undefined);
            setDropCategory(undefined);
        }
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack", children: [(0, jsx_runtime_1.jsx)("header", { className: "page-header", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "D\u00E9mat\u00E9rialisation" }), (0, jsx_runtime_1.jsx)("h1", { children: "Documents chantier" })] }) }), (0, jsx_runtime_1.jsxs)("section", { className: "document-controls panel", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantier" }), (0, jsx_runtime_1.jsxs)("select", { value: projectId, onChange: (event) => setProjectId(event.target.value), disabled: !projects.length, children: [!projects.length && (0, jsx_runtime_1.jsx)("option", { value: "", children: "Aucun chantier cr\u00E9\u00E9" }), projects.map((project) => (0, jsx_runtime_1.jsxs)("option", { value: project.id, children: [project.name, " \u2014 ", project.city] }, project.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Cat\u00E9gorie du nouveau fichier" }), (0, jsx_runtime_1.jsx)("select", { value: category, onChange: (event) => {
                                    const nextCategory = event.target.value;
                                    setCategory(nextCategory);
                                    setCategoryFilter(nextCategory);
                                }, children: categories.map((item) => (0, jsx_runtime_1.jsx)("option", { value: item, children: item }, item)) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "upload-button primary-button", children: [!projects.length ? 'Crée un chantier pour importer' : uploading ? 'Import en cours…' : '+ Importer des documents', (0, jsx_runtime_1.jsx)("input", { ref: inputRef, type: "file", multiple: true, onChange: (event) => void chooseFiles(event.target.files), disabled: uploading || !projects.length, accept: ".pdf,.png,.jpg,.jpeg,.webp,.dwg,.dxf,.doc,.docx,.xls,.xlsx" })] })] }), !projects.length && ((0, jsx_runtime_1.jsxs)("div", { className: "panel empty-state", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aucun dossier chantier disponible." }), (0, jsx_runtime_1.jsx)("span", { children: "Cr\u00E9e d\u2019abord un chantier pour pouvoir classer et ouvrir ses documents." })] })), (0, jsx_runtime_1.jsx)("section", { className: "document-grid", children: categories.map((item) => {
                    const count = projectDocuments.filter((document) => document.category === item).length;
                    const active = categoryFilter === item;
                    const isDropTarget = dropCategory === item && draggingId;
                    return ((0, jsx_runtime_1.jsxs)("button", { className: `folder-card ${active ? 'active' : ''} ${isDropTarget ? 'drag-over' : ''}`, onClick: () => {
                            setCategory(item);
                            setCategoryFilter(item);
                        }, onDragEnter: (event) => {
                            if (!draggingId)
                                return;
                            event.preventDefault();
                            setDropCategory(item);
                        }, onDragOver: (event) => {
                            if (!draggingId)
                                return;
                            event.preventDefault();
                            event.dataTransfer.dropEffect = 'move';
                            setDropCategory(item);
                        }, onDragLeave: (event) => {
                            if (!event.currentTarget.contains(event.relatedTarget))
                                setDropCategory(undefined);
                        }, onDrop: (event) => {
                            event.preventDefault();
                            const documentId = event.dataTransfer.getData('text/plain') || draggingId;
                            if (documentId)
                                void moveDocument(documentId, item);
                        }, "aria-label": `Ouvrir le dossier ${item}${draggingId ? ` ou y déplacer le document` : ''}`, children: [(0, jsx_runtime_1.jsx)("span", { children: "\u25A3" }), (0, jsx_runtime_1.jsx)("strong", { children: item }), (0, jsx_runtime_1.jsxs)("small", { children: [count, " document", count > 1 ? 's' : ''] })] }, item));
                }) }), (0, jsx_runtime_1.jsx)("p", { className: "document-drag-hint", children: "Pour d\u00E9placer un fichier, maintiens-le puis d\u00E9pose-le sur le dossier de destination." }), (0, jsx_runtime_1.jsxs)("section", { className: "panel document-list-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h2", { children: categoryFilter === 'Tous' ? 'Fichiers du chantier' : categoryFilter }), categoryFilter !== 'Tous' && (0, jsx_runtime_1.jsx)("button", { className: "text-button document-clear-filter", onClick: () => setCategoryFilter('Tous'), children: "Afficher tous les documents" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [displayed.length, " fichier(s)"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "document-list", children: [displayed.map((document) => ((0, jsx_runtime_1.jsxs)("article", { className: `document-row ${draggingId === document.id ? 'dragging' : ''} ${movingId === document.id ? 'moving' : ''}`, draggable: movingId !== document.id, onDragStart: (event) => {
                                    setDraggingId(document.id);
                                    event.dataTransfer.effectAllowed = 'move';
                                    event.dataTransfer.setData('text/plain', document.id);
                                }, onDragEnd: () => {
                                    setDraggingId(undefined);
                                    setDropCategory(undefined);
                                }, onDoubleClick: () => void openDocument(document), children: [(0, jsx_runtime_1.jsx)("span", { className: "file-icon", children: getFileLabel(document.name) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: document.name }), (0, jsx_runtime_1.jsxs)("small", { children: [document.category, " \u00B7 Ajout\u00E9 le ", (0, planning_1.formatDate)(document.uploadedAt), " \u00B7 ", document.sizeLabel] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "document-row-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "document-delete-button", onClick: () => void deleteDocument(document), disabled: deletingId === document.id || openingId === document.id || movingId === document.id, children: deletingId === document.id ? 'Suppression…' : 'Supprimer' }), (0, jsx_runtime_1.jsx)("button", { className: "document-open-button", onClick: () => void openDocument(document), disabled: openingId === document.id || movingId === document.id || deletingId === document.id, children: movingId === document.id ? 'Déplacement…' : openingId === document.id ? 'Ouverture…' : 'Ouvrir' })] })] }, document.id))), !displayed.length && (0, jsx_runtime_1.jsx)("p", { className: "empty-state", children: "Aucun document dans cette cat\u00E9gorie." })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "document-help", children: "Les PDF et images s\u2019ouvrent directement dans le navigateur. Les formats m\u00E9tier comme DWG s\u2019ouvrent ou se t\u00E9l\u00E9chargent selon les logiciels install\u00E9s sur ton ordinateur." })] }));
}

},
"src/components/Modal": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = Modal;
const jsx_runtime_1 = require("react/jsx-runtime");
function Modal({ title, children, onClose, wide = false }) {
    return ((0, jsx_runtime_1.jsx)("div", { className: "modal-backdrop", role: "presentation", onMouseDown: onClose, children: (0, jsx_runtime_1.jsxs)("section", { className: `modal ${wide ? 'modal-wide' : ''}`, role: "dialog", "aria-modal": "true", onMouseDown: (event) => event.stopPropagation(), children: [(0, jsx_runtime_1.jsxs)("header", { className: "modal-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Conduct'Home" }), (0, jsx_runtime_1.jsx)("h2", { children: title })] }), (0, jsx_runtime_1.jsx)("button", { className: "icon-button", onClick: onClose, "aria-label": "Fermer", children: "\u00D7" })] }), children] }) }));
}

},
"src/components/NotificationsView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsView = NotificationsView;
const jsx_runtime_1 = require("react/jsx-runtime");
const planning_1 = require("../lib/planning");
function NotificationsView({ notifications, onDismiss }) {
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack", children: [(0, jsx_runtime_1.jsx)("header", { className: "page-header", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Anticipation" }), (0, jsx_runtime_1.jsx)("h1", { children: "Alertes et interventions" })] }) }), (0, jsx_runtime_1.jsxs)("section", { className: "panel notification-list-panel", children: [notifications.map((notification) => ((0, jsx_runtime_1.jsxs)("article", { className: `notification-row ${notification.severity}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "notification-symbol", children: notification.severity === 'urgent' ? '!' : notification.severity === 'warning' ? '⏱' : 'i' }), (0, jsx_runtime_1.jsxs)("div", { className: "notification-content", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: notification.projectName }), (0, jsx_runtime_1.jsx)("span", { children: (0, planning_1.formatDate)(notification.dueDate) })] }), (0, jsx_runtime_1.jsx)("h3", { children: notification.title }), notification.artisanName && (0, jsx_runtime_1.jsxs)("p", { children: ["Intervenant : ", notification.artisanName] })] }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button notification-dismiss", onClick: () => void onDismiss(notification.id), children: "\u2713 Marquer trait\u00E9" })] }, notification.id))), !notifications.length && ((0, jsx_runtime_1.jsxs)("div", { className: "notification-empty-state", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2713" }), (0, jsx_runtime_1.jsx)("strong", { children: "Tout est trait\u00E9" }), (0, jsx_runtime_1.jsx)("p", { children: "Aucune intervention ne demande ton attention pour le moment." })] }))] })] }));
}

},
"src/components/OrdersView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersView = OrdersView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const repository_1 = require("../lib/repository");
const Modal_1 = require("./Modal");
const visibleCategories = ['Plans', 'Commandes', 'Choix clients', 'Administratif'];
const categoryOrder = new Map(visibleCategories.map((category, index) => [category, index]));
const naturalCollator = new Intl.Collator('fr', { numeric: true, sensitivity: 'base' });
const downloadBlob = (blob, name) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
};
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(blob);
});
const sanitizeHeader = (value) => value.replace(/[\r\n]+/g, ' ').trim();
const safeText = (value) => typeof value === 'string' ? value.trim() : '';
const getClientInitials = (name) => safeText(name)
    .replace(/\b(M\.?|Mme|Mlle|Monsieur|Madame)\b/gi, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'CL';
const createEml = async ({ to, subject, body, attachments, }) => {
    const boundary = `----ConductHome-${Date.now()}`;
    let content = [
        'X-Unsent: 1',
        `To: ${sanitizeHeader(to)}`,
        `Subject: ${sanitizeHeader(subject)}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        '',
        `--${boundary}`,
        'Content-Type: text/plain; charset="UTF-8"',
        'Content-Transfer-Encoding: 8bit',
        '',
        body,
        '',
    ].join('\r\n');
    for (const attachment of attachments) {
        const encoded = await blobToBase64(attachment.blob);
        const lines = encoded.match(/.{1,76}/g)?.join('\r\n') ?? '';
        const safeName = attachment.name.replaceAll('"', '');
        content += [
            `--${boundary}`,
            `Content-Type: ${attachment.mimeType || attachment.blob.type || 'application/octet-stream'}; name="${safeName}"`,
            `Content-Disposition: attachment; filename="${safeName}"`,
            'Content-Transfer-Encoding: base64',
            '',
            lines,
            '',
        ].join('\r\n');
    }
    content += `--${boundary}--\r\n`;
    return new Blob([content], { type: 'message/rfc822' });
};
function OrdersView({ projects, artisans, documents }) {
    const [projectId, setProjectId] = (0, react_1.useState)('');
    const [artisanId, setArtisanId] = (0, react_1.useState)('');
    const [selectedDocumentIds, setSelectedDocumentIds] = (0, react_1.useState)([]);
    const [activeCategory, setActiveCategory] = (0, react_1.useState)('Plans');
    const [subject, setSubject] = (0, react_1.useState)('');
    const [body, setBody] = (0, react_1.useState)('');
    const [preparing, setPreparing] = (0, react_1.useState)(false);
    const [message, setMessage] = (0, react_1.useState)();
    const sortedProjects = (0, react_1.useMemo)(() => projects
        .filter((item) => Boolean(item))
        .slice()
        .sort((left, right) => naturalCollator.compare(safeText(left.name), safeText(right.name))), [projects]);
    const project = projects.find((item) => item.id === projectId);
    const artisan = artisans.find((item) => item.id === artisanId);
    const projectDocuments = (0, react_1.useMemo)(() => documents
        .filter((item) => item.projectId === projectId)
        .sort((left, right) => {
        const categoryDifference = (categoryOrder.get(left.category) ?? 999) - (categoryOrder.get(right.category) ?? 999);
        if (categoryDifference !== 0)
            return categoryDifference;
        return naturalCollator.compare(left.name, right.name);
    }), [documents, projectId]);
    const visibleDocuments = (0, react_1.useMemo)(() => projectDocuments.filter((document) => document.category === activeCategory), [projectDocuments, activeCategory]);
    const selectedDocuments = (0, react_1.useMemo)(() => projectDocuments.filter((document) => selectedDocumentIds.includes(document.id)), [projectDocuments, selectedDocumentIds]);
    const selectProject = (nextProjectId) => {
        setProjectId(nextProjectId);
        setSelectedDocumentIds([]);
        const selectedProject = projects.find((item) => item.id === nextProjectId);
        const projectName = safeText(selectedProject?.name) || 'Sans nom';
        const city = safeText(selectedProject?.city);
        setSubject(selectedProject ? `Commandes - ${projectName}${city ? ` [${city}]` : ''}` : '');
        setBody(selectedProject
            ? `Bonjour,\n\nVeuillez trouver ci-joint les éléments de commande pour le chantier ${projectName}${city ? ` à ${city}` : ''}.\n\nCordialement,`
            : '');
    };
    const toggleDocument = (id) => {
        setSelectedDocumentIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    };
    const prepareOutlook = async () => {
        if (!project || !artisan)
            return;
        const email = (artisan.orderEmail || artisan.email || '').trim();
        if (!email) {
            setMessage("Ajoute d'abord une adresse e-mail dans la fiche de l'artisan.");
            return;
        }
        setPreparing(true);
        setMessage(undefined);
        try {
            const attachments = [];
            for (const document of projectDocuments.filter((item) => selectedDocumentIds.includes(item.id))) {
                const blob = await (0, repository_1.getLocalDocumentBlob)(document);
                attachments.push({ blob, name: document.name, mimeType: document.mimeType });
            }
            if (artisan.conventionLocalFileId && artisan.conventionName) {
                const blob = await (0, repository_1.getArtisanConventionBlob)(artisan);
                attachments.push({
                    blob,
                    name: artisan.conventionName,
                    mimeType: artisan.conventionMimeType,
                });
            }
            const finalSubject = subject.trim() || `Commandes - ${safeText(project.name) || 'Sans nom'}${safeText(project.city) ? ` [${safeText(project.city)}]` : ''}`;
            const eml = await createEml({
                to: email,
                subject: finalSubject,
                body,
                attachments,
            });
            downloadBlob(eml, `${finalSubject.replace(/[\/:*?"<>|]/g, '-').trim() || 'Commandes'}.eml`);
            setMessage("Le brouillon Outlook a été créé avec le destinataire et les pièces jointes. Ouvre le fichier .eml : il doit s’afficher en mode rédaction avec le bouton Envoyer.");
        }
        catch (reason) {
            setMessage(reason instanceof Error ? reason.message : 'Préparation impossible.');
        }
        finally {
            setPreparing(false);
        }
    };
    const closeOrderWindow = () => {
        selectProject('');
        setArtisanId('');
        setMessage(undefined);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack orders-view", children: [(0, jsx_runtime_1.jsx)("header", { className: "page-header order-page-header", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Pr\u00E9paration Outlook" }), (0, jsx_runtime_1.jsx)("h1", { children: "Commandes" }), (0, jsx_runtime_1.jsx)("p", { children: "Choisis un chantier pour pr\u00E9parer la commande." })] }) }), (0, jsx_runtime_1.jsxs)("section", { className: "panel order-client-picker", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Chantiers actifs" }), (0, jsx_runtime_1.jsx)("h2", { children: "Choisir un chantier" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [sortedProjects.length, " chantier", sortedProjects.length > 1 ? 's' : ''] })] }), sortedProjects.length ? ((0, jsx_runtime_1.jsx)("div", { className: "order-project-list", children: sortedProjects.map((item) => {
                            const projectName = safeText(item.name) || 'Chantier sans nom';
                            const city = safeText(item.city);
                            return ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: "order-project-row", onClick: () => selectProject(item.id), children: [(0, jsx_runtime_1.jsxs)("span", { className: "order-project-main", children: [(0, jsx_runtime_1.jsx)("strong", { children: projectName }), city ? (0, jsx_runtime_1.jsxs)("span", { className: "order-project-city", children: ["- ", city] }) : null] }), (0, jsx_runtime_1.jsx)("span", { className: "order-project-chevron", "aria-hidden": "true", children: "\u2192" })] }, item.id));
                        }) })) : (0, jsx_runtime_1.jsxs)("div", { className: "empty-state order-client-empty", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aucun chantier disponible." }), (0, jsx_runtime_1.jsx)("span", { children: "Cr\u00E9e d\u2019abord un chantier pour pr\u00E9parer une commande." })] })] }), project && ((0, jsx_runtime_1.jsx)(Modal_1.Modal, { title: `Commande — ${safeText(project.clientName) || safeText(project.name) || 'Chantier'}`, onClose: closeOrderWindow, wide: true, children: (0, jsx_runtime_1.jsxs)("div", { className: "order-compose-modal-content", children: [(0, jsx_runtime_1.jsxs)("section", { className: "panel order-selected-client", children: [(0, jsx_runtime_1.jsx)("span", { className: "order-client-avatar", children: getClientInitials(project.clientName || project.name) }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Client s\u00E9lectionn\u00E9" }), (0, jsx_runtime_1.jsx)("strong", { children: safeText(project.clientName) || safeText(project.name) || 'Client sans nom' }), (0, jsx_runtime_1.jsxs)("small", { children: [safeText(project.name) || 'Chantier sans nom', " \u00B7 ", safeText(project.postalCode) ? `${safeText(project.postalCode)} ` : '', safeText(project.city)] })] })] }), (0, jsx_runtime_1.jsx)("section", { className: "panel order-builder", children: (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantier" }), (0, jsx_runtime_1.jsxs)("select", { value: projectId, onChange: (event) => selectProject(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Choisir un chantier" }), projects.map((item) => (0, jsx_runtime_1.jsxs)("option", { value: item.id, children: [safeText(item.name) || 'Chantier sans nom', " \u2014 ", safeText(item.city)] }, item.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprise" }), (0, jsx_runtime_1.jsxs)("select", { value: artisanId, onChange: (event) => setArtisanId(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Choisir une entreprise" }), artisans.map((item) => (0, jsx_runtime_1.jsx)("option", { value: item.id, children: safeText(item.company) || 'Entreprise sans nom' }, item.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Destinataire" }), (0, jsx_runtime_1.jsx)("input", { value: artisan?.orderEmail || artisan?.email || '', readOnly: true, placeholder: "Adresse r\u00E9cup\u00E9r\u00E9e depuis la fiche entreprise" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Objet" }), (0, jsx_runtime_1.jsx)("input", { value: subject, onChange: (event) => setSubject(event.target.value), placeholder: "Commandes - Chantier [Ville]" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Message" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 7, value: body, onChange: (event) => setBody(event.target.value) })] })] }) }), (0, jsx_runtime_1.jsxs)("section", { className: "panel order-documents", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Pi\u00E8ces jointes" }), (0, jsx_runtime_1.jsx)("h2", { children: "Documents du chantier" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "muted", children: [selectedDocumentIds.length, " s\u00E9lectionn\u00E9(s)"] })] }), (0, jsx_runtime_1.jsx)("div", { className: "order-category-tabs", role: "tablist", "aria-label": "Cat\u00E9gories de documents", children: visibleCategories.map((category) => {
                                        const count = projectDocuments.filter((document) => document.category === category).length;
                                        return ((0, jsx_runtime_1.jsxs)("button", { type: "button", className: activeCategory === category ? 'active' : '', onClick: () => setActiveCategory(category), children: [category, (0, jsx_runtime_1.jsx)("span", { children: count })] }, category));
                                    }) }), (0, jsx_runtime_1.jsxs)("div", { className: "order-document-list", children: [visibleDocuments.map((document) => ((0, jsx_runtime_1.jsxs)("label", { className: "order-document-row", children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: selectedDocumentIds.includes(document.id), onChange: () => toggleDocument(document.id) }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("strong", { children: document.name }), (0, jsx_runtime_1.jsx)("small", { children: document.category })] })] }, document.id))), !visibleDocuments.length && (0, jsx_runtime_1.jsxs)("p", { className: "empty-state", children: ["Aucun document dans l\u2019onglet ", activeCategory, "."] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "order-selection-recap", children: [(0, jsx_runtime_1.jsxs)("div", { className: "order-selection-recap-head", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "R\u00E9capitulatif" }), (0, jsx_runtime_1.jsx)("strong", { children: "Documents s\u00E9lectionn\u00E9s" })] }), (0, jsx_runtime_1.jsxs)("span", { children: [selectedDocuments.length, " pi\u00E8ce", selectedDocuments.length > 1 ? 's' : ''] })] }), selectedDocuments.length ? ((0, jsx_runtime_1.jsx)("ul", { children: selectedDocuments.map((document) => (0, jsx_runtime_1.jsxs)("li", { children: [(0, jsx_runtime_1.jsx)("span", { children: document.name }), (0, jsx_runtime_1.jsx)("small", { children: document.category })] }, document.id)) })) : ((0, jsx_runtime_1.jsx)("p", { children: "Aucun document s\u00E9lectionn\u00E9 pour le moment." }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "order-convention", children: [(0, jsx_runtime_1.jsx)("span", { children: "Convention entreprise" }), (0, jsx_runtime_1.jsx)("strong", { children: artisan?.conventionName || 'Aucune convention enregistrée' })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel order-actions", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Fonctionnement local Outlook" }), (0, jsx_runtime_1.jsx)("span", { children: "Tu coches uniquement les documents \u00E0 joindre. La convention de l\u2019entreprise est ajout\u00E9e automatiquement lorsqu\u2019elle existe." })] }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: prepareOutlook, disabled: preparing || !project || !artisan, children: preparing ? 'Préparation…' : 'Créer le brouillon Outlook' })] }), message && (0, jsx_runtime_1.jsx)("p", { className: "order-message", children: message })] }) }))] }));
}

},
"src/components/PlanningBoard": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanningBoard = PlanningBoard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const stages_1 = require("../data/stages");
const artisans_1 = require("../lib/artisans");
const planning_1 = require("../lib/planning");
const Modal_1 = require("./Modal");
const artisanPlanningPdf_1 = require("../lib/artisanPlanningPdf");
const outlookDraft_1 = require("../lib/outlookDraft");
const statusLabels = {
    todo: 'À planifier',
    scheduled: 'Planifiée',
    in_progress: 'En cours',
    done: 'Terminée',
    blocked: 'Bloquée',
};
const groupOrder = ['Préparation', 'Gros œuvre', "Hors d'eau / hors d'air", 'Second œuvre', 'Finitions'];
const printGroupClasses = {
    'Préparation': 'preparation',
    'Gros œuvre': 'structural',
    "Hors d'eau / hors d'air": 'weathertight',
    'Second œuvre': 'second-fix',
    'Finitions': 'finishes',
};
const formatPrintDate = (date) => {
    if (!date)
        return '—';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(new Date(`${date}T12:00:00`));
};
const formatIsoWeek = (date) => {
    if (!date)
        return '—';
    const parsed = new Date(`${date}T12:00:00`);
    if (Number.isNaN(parsed.getTime()))
        return date;
    const target = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `S ${week}`;
};
const isPast = (date) => {
    if (!date)
        return false;
    const value = new Date(`${date}T12:00:00`).getTime();
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    return value < today.getTime();
};
const shortenCompanyForPrint = (company) => {
    const cleaned = company
        .replace(/^(sarl|sas|sasu|eurl|ets|entreprise)\s+/i, '')
        .replace(/\s+/g, ' ')
        .trim();
    if (cleaned.length <= 18)
        return cleaned;
    return `${cleaned.slice(0, 17).trim()}...`;
};
function PlanningBoard({ projects, lots, artisans, onSaveProject, onAddProject }) {
    const [editing, setEditing] = (0, react_1.useState)(null);
    const [search, setSearch] = (0, react_1.useState)('');
    const [artisanFilter, setArtisanFilter] = (0, react_1.useState)('all');
    const [planningFilter, setPlanningFilter] = (0, react_1.useState)('all');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [density, setDensity] = (0, react_1.useState)('compact');
    const [artisanPrintId, setArtisanPrintId] = (0, react_1.useState)('');
    const [preparingArtisanMail, setPreparingArtisanMail] = (0, react_1.useState)(false);
    const [artisanMailMessage, setArtisanMailMessage] = (0, react_1.useState)();
    const artisanCompanies = (0, react_1.useMemo)(() => Array.from(new Set(artisans.map((artisan) => artisan.company.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'fr')), [artisans]);
    const resolveArtisan = (stage) => {
        const byId = stage.artisanId ? artisans.find((artisan) => artisan.id === stage.artisanId) : undefined;
        if (byId)
            return byId;
        const stored = (0, artisans_1.normalizeTradeName)(stage.artisanName ?? '');
        if (!stored)
            return undefined;
        return artisans.find((artisan) => [artisan.company, artisan.contactName, artisan.code]
            .some((value) => (0, artisans_1.normalizeTradeName)(value) === stored));
    };
    const getArtisanName = (stage) => {
        const linked = resolveArtisan(stage);
        return linked?.company || stage.artisanName?.trim() || '';
    };
    const getArtisanPlanningCode = (stage) => {
        const linked = resolveArtisan(stage);
        return linked?.code?.trim() || linked?.company || stage.artisanName?.trim() || '';
    };
    const selectedArtisan = (0, react_1.useMemo)(() => artisans.find((artisan) => artisan.id === artisanPrintId), [artisans, artisanPrintId]);
    const artisanPlanningRows = (0, react_1.useMemo)(() => {
        if (!selectedArtisan)
            return [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return projects
            .flatMap((project) => project.stages
            .map((stage) => {
            const definition = stages_1.STAGES.find((item) => item.id === stage.stageId);
            const linked = resolveArtisan(stage);
            const sameArtisan = linked?.id === selectedArtisan.id
                || (0, artisans_1.normalizeTradeName)(stage.artisanName ?? '') === (0, artisans_1.normalizeTradeName)(selectedArtisan.company);
            if (!definition || !sameArtisan || !stage.plannedDate || stage.status === 'done')
                return undefined;
            const planned = new Date(`${stage.plannedDate}T12:00:00`);
            const isUpcoming = planned.getTime() >= today.getTime();
            if (!isUpcoming)
                return undefined;
            return {
                id: `${project.id}-${stage.stageId}`,
                project,
                stage,
                definition,
                plannedDate: stage.plannedDate,
                plannedTime: planned.getTime(),
                overdue: isPast(stage.plannedDate),
            };
        })
            .filter(Boolean))
            .sort((a, b) => (a?.plannedTime ?? 0) - (b?.plannedTime ?? 0))
            .slice(0, 30);
    }, [projects, selectedArtisan, artisans]);
    const selectedArtisanStageLabels = selectedArtisan
        ? stages_1.STAGES
            .filter((stage) => selectedArtisan.stageIds?.includes(stage.id))
            .map((stage) => stage.label)
        : [];
    const filtered = (0, react_1.useMemo)(() => {
        const normalized = search.trim().toLowerCase();
        return projects.filter((project) => {
            const matchesSearch = !normalized || `${project.name} ${project.city} ${project.clientName}`.toLowerCase().includes(normalized);
            const matchesArtisan = artisanFilter === 'all' || project.stages.some((stage) => getArtisanName(stage) === artisanFilter);
            const matchesPlanning = planningFilter === 'all'
                || (planningFilter === 'unplanned' && project.stages.some((stage) => !stage.plannedDate))
                || (planningFilter === 'late' && project.stages.some(planning_1.isStageLate));
            return matchesSearch && matchesArtisan && matchesPlanning;
        });
    }, [projects, search, artisanFilter, planningFilter, artisans]);
    const editingDefinition = editing ? stages_1.STAGES.find((stage) => stage.id === editing.stage.stageId) : undefined;
    const eligibleArtisans = (0, react_1.useMemo)(() => {
        if (!editingDefinition)
            return [];
        return artisans
            .filter((artisan) => (0, artisans_1.artisanIntervenesAtStage)(artisan, editingDefinition.id, lots))
            .sort((a, b) => a.company.localeCompare(b.company, 'fr'));
    }, [editingDefinition, artisans, lots]);
    const matchedLotNames = (0, react_1.useMemo)(() => editingDefinition
        ? lots.filter((lot) => (0, artisans_1.getLotStageIds)(lot).includes(editingDefinition.id)).map((lot) => lot.name)
        : [], [editingDefinition, lots]);
    const handleField = (key, value) => {
        if (!editing)
            return;
        setEditing({ ...editing, stage: { ...editing.stage, [key]: value } });
    };
    const handleArtisanSelection = (artisanId) => {
        if (!editing)
            return;
        const artisan = artisans.find((item) => item.id === artisanId);
        setEditing({
            ...editing,
            stage: {
                ...editing.stage,
                artisanId: artisan?.id,
                artisanName: artisan?.company,
                notifyBeforeDays: artisan ? (editing.stage.notifyBeforeDays ?? artisan.leadTimeDays) : editing.stage.notifyBeforeDays,
            },
        });
    };
    const openEditor = (project, stage) => {
        const definition = stages_1.STAGES.find((item) => item.id === stage.stageId);
        const linked = resolveArtisan(stage);
        const linkedIsEligible = linked && definition
            ? (0, artisans_1.artisanIntervenesAtStage)(linked, definition.id, lots)
            : false;
        setEditing({
            project,
            stage: linked && linkedIsEligible
                ? { ...stage, artisanId: linked.id, artisanName: linked.company }
                : { ...stage, artisanId: undefined, artisanName: undefined },
        });
    };
    const save = async () => {
        if (!editing)
            return;
        setSaving(true);
        const linked = editing.stage.artisanId ? artisans.find((artisan) => artisan.id === editing.stage.artisanId) : undefined;
        const cleanedStage = {
            ...editing.stage,
            artisanId: linked?.id,
            artisanName: linked?.company,
            plannedDate: editing.stage.plannedDate || undefined,
            plannedTime: editing.stage.plannedTime || undefined,
            actualInterventionDate: editing.stage.actualInterventionDate || undefined,
            actualDate: editing.stage.actualDate || undefined,
        };
        const project = {
            ...editing.project,
            updatedAt: new Date().toISOString(),
            stages: editing.project.stages.map((stage) => stage.stageId === cleanedStage.stageId ? cleanedStage : stage),
        };
        try {
            await onSaveProject(project);
            setEditing(null);
        }
        finally {
            setSaving(false);
        }
    };
    const markDone = () => {
        if (!editing)
            return;
        const today = new Date().toISOString().slice(0, 10);
        setEditing({
            ...editing,
            stage: {
                ...editing.stage,
                status: 'done',
                actualDate: editing.stage.actualDate || today,
            },
        });
    };
    const printPlanning = () => {
        const previousTitle = document.title;
        document.body.dataset.printMode = 'general';
        document.title = `Planning ARLOGIS - ${new Date().toLocaleDateString('fr-FR')}`;
        window.print();
        window.setTimeout(() => {
            document.title = previousTitle;
            delete document.body.dataset.printMode;
        }, 600);
    };
    const printArtisanPlanning = () => {
        if (!selectedArtisan)
            return;
        const previousTitle = document.title;
        document.body.dataset.printMode = 'artisan';
        document.title = `Planning ${selectedArtisan.company} - ${new Date().toLocaleDateString('fr-FR')}`;
        window.print();
        window.setTimeout(() => {
            document.title = previousTitle;
            delete document.body.dataset.printMode;
        }, 600);
    };
    const emailArtisanPlanning = async () => {
        if (!selectedArtisan || preparingArtisanMail)
            return;
        const email = (selectedArtisan.email || selectedArtisan.orderEmail || '').trim();
        if (!email) {
            setArtisanMailMessage("Ajoute d'abord une adresse e-mail dans la fiche de cet artisan.");
            return;
        }
        setPreparingArtisanMail(true);
        setArtisanMailMessage(undefined);
        try {
            const pdf = (0, artisanPlanningPdf_1.createArtisanPlanningPdf)({
                artisan: selectedArtisan,
                rows: artisanPlanningRows.filter(Boolean),
            });
            const safeCompany = (0, artisanPlanningPdf_1.sanitizePlanningFileName)(selectedArtisan.company || 'Entreprise') || 'Entreprise';
            const pdfName = `Planning-Maisons-Arlogis-${safeCompany}.pdf`;
            const signatureResponse = await fetch('./signature-simon-batard.jpg?v=184');
            if (!signatureResponse.ok)
                throw new Error('La signature électronique n’a pas pu être chargée.');
            const signature = await signatureResponse.blob();
            const signatureContentId = 'signature-simon-batard';
            const plainBody = `Bonjour,

Veuillez trouver ci-joint le planning prévisionnel de vos prochaines interventions.

Cordialement,`;
            const htmlBody = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.5;color:#202124"><p>Bonjour,</p><p>Veuillez trouver ci-joint le planning prévisionnel de vos prochaines interventions.</p><p>Cordialement,</p><p style="margin:18px 0 0"><img src="cid:${signatureContentId}" alt="Signature Simon Batard" width="800" style="display:block;width:100%;max-width:800px;height:auto;border:0"></p></div>`;
            await (0, outlookDraft_1.createOutlookDraft)({
                to: email,
                subject: 'Maisons Arlogis - Planning',
                body: plainBody,
                htmlBody,
                inlineImages: [{
                        blob: signature,
                        name: 'signature-simon-batard.jpg',
                        mimeType: 'image/jpeg',
                        contentId: signatureContentId,
                    }],
                attachments: [{ blob: pdf, name: pdfName, mimeType: 'application/pdf' }],
                fileName: `Maisons-Arlogis-Planning-${safeCompany}.eml`,
            });
        }
        catch (reason) {
            setArtisanMailMessage(reason instanceof Error ? reason.message : 'Création du brouillon impossible.');
        }
        finally {
            setPreparingArtisanMail(false);
        }
    };
    const groupedStages = groupOrder.map((group) => ({
        group,
        stages: stages_1.STAGES.filter((stage) => stage.group === group),
    }));
    const printStats = (0, react_1.useMemo)(() => ({
        projects: filtered.length,
        unplanned: filtered.reduce((total, project) => total + project.stages.filter((stage) => !stage.plannedDate).length, 0),
        late: filtered.reduce((total, project) => total + project.stages.filter(planning_1.isStageLate).length, 0),
        completed: filtered.reduce((total, project) => total + project.stages.filter((stage) => stage.status === 'done').length, 0),
    }), [filtered]);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack planning-view planning-v2", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header planning-page-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Planning par \u00E9tapes" }), (0, jsx_runtime_1.jsx)("h1", { children: "Planning g\u00E9n\u00E9ral" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "planning-header-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button print-planning-button", onClick: printPlanning, children: "\u2399 Imprimer / PDF" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: onAddProject, children: "+ Nouveau chantier" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "planning-toolbar panel planning-toolbar-v2", children: [(0, jsx_runtime_1.jsxs)("label", { className: "search-field planning-search", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2315" }), (0, jsx_runtime_1.jsx)("input", { value: search, onChange: (event) => setSearch(event.target.value), placeholder: "Rechercher un chantier, un client ou une ville" })] }), (0, jsx_runtime_1.jsxs)("label", { className: "select-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprise" }), (0, jsx_runtime_1.jsxs)("select", { value: artisanFilter, onChange: (event) => setArtisanFilter(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Toutes les entreprises" }), artisanCompanies.map((name) => (0, jsx_runtime_1.jsx)("option", { value: name, children: name }, name))] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "select-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tat du planning" }), (0, jsx_runtime_1.jsxs)("select", { value: planningFilter, onChange: (event) => setPlanningFilter(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "all", children: "Tous les chantiers" }), (0, jsx_runtime_1.jsx)("option", { value: "unplanned", children: "Dates manquantes" }), (0, jsx_runtime_1.jsx)("option", { value: "late", children: "\u00C9tapes en retard" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "density-control", "aria-label": "Densit\u00E9 du planning", children: [(0, jsx_runtime_1.jsx)("button", { className: density === 'comfortable' ? 'active' : '', onClick: () => setDensity('comfortable'), children: "Confort" }), (0, jsx_runtime_1.jsx)("button", { className: density === 'compact' ? 'active' : '', onClick: () => setDensity('compact'), children: "Fin" }), (0, jsx_runtime_1.jsx)("button", { className: density === 'dense' ? 'active' : '', onClick: () => setDensity('dense'), children: "Tr\u00E8s fin" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "planning-summary-strip", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: filtered.length }), (0, jsx_runtime_1.jsx)("span", { children: "chantiers affich\u00E9s" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: filtered.reduce((total, project) => total + project.stages.filter((stage) => !stage.plannedDate).length, 0) }), (0, jsx_runtime_1.jsx)("span", { children: "dates \u00E0 renseigner" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: filtered.reduce((total, project) => total + project.stages.filter((stage) => stage.status !== 'done' && isPast(stage.plannedDate)).length, 0) }), (0, jsx_runtime_1.jsx)("span", { children: "\u00E9tapes en retard" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "planning-legend-v2", children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "status-dot-v2 done" }), " Termin\u00E9"] }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "status-dot-v2 in-progress" }), " En cours"] }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "status-dot-v2 late" }), " En retard"] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "artisan-planning-panel panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-planning-head", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Planning artisan" }), (0, jsx_runtime_1.jsx)("h2", { children: "Sortir un planning par entreprise" }), (0, jsx_runtime_1.jsx)("p", { children: "S\u00E9lectionne une entreprise pour g\u00E9n\u00E9rer la liste de ses prochaines interventions programm\u00E9es." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-planning-actions", children: [(0, jsx_runtime_1.jsxs)("label", { className: "select-field artisan-planning-select", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprise \u00E0 envoyer" }), (0, jsx_runtime_1.jsxs)("select", { value: artisanPrintId, onChange: (event) => setArtisanPrintId(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Choisir une entreprise" }), artisans
                                                        .slice()
                                                        .sort((a, b) => a.company.localeCompare(b.company, 'fr'))
                                                        .map((artisan) => (0, jsx_runtime_1.jsx)("option", { value: artisan.id, children: artisan.company }, artisan.id))] })] }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: printArtisanPlanning, disabled: !selectedArtisan, children: "\u2399 PDF artisan" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: () => void emailArtisanPlanning(), disabled: !selectedArtisan || preparingArtisanMail, children: preparingArtisanMail ? 'Préparation…' : '✉ Envoyer le planning' })] })] }), artisanMailMessage && (0, jsx_runtime_1.jsx)("p", { className: "artisan-planning-mail-message", children: artisanMailMessage }), selectedArtisan ? ((0, jsx_runtime_1.jsxs)("div", { className: "artisan-planning-preview", children: [(0, jsx_runtime_1.jsxs)("div", { className: "artisan-planning-identity", children: [(0, jsx_runtime_1.jsx)("strong", { children: selectedArtisan.company }), (0, jsx_runtime_1.jsxs)("span", { children: [selectedArtisan.contactName || 'Contact non renseigné', " \u00B7 ", selectedArtisan.phone || 'Téléphone non renseigné'] }), (0, jsx_runtime_1.jsxs)("small", { children: ["\u00C9tapes d\u00E9clar\u00E9es : ", selectedArtisanStageLabels.length ? selectedArtisanStageLabels.join(', ') : 'aucune étape cochée'] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-planning-count", children: [(0, jsx_runtime_1.jsx)("strong", { children: artisanPlanningRows.length }), (0, jsx_runtime_1.jsx)("span", { children: "interventions \u00E0 venir" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-planning-mini-list", children: [artisanPlanningRows.slice(0, 6).map((row) => row && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("b", { children: formatIsoWeek(row.plannedDate) }), (0, jsx_runtime_1.jsxs)("span", { children: [row.project.name, " \u00B7 ", row.definition.label] }), (0, jsx_runtime_1.jsx)("small", { children: row.project.city || row.project.address || 'Adresse non renseignée' })] }, row.id))), artisanPlanningRows.length === 0 && (0, jsx_runtime_1.jsx)("p", { children: "Aucune intervention future programm\u00E9e avec cette entreprise." })] })] })) : ((0, jsx_runtime_1.jsx)("p", { className: "artisan-planning-empty", children: "Choisis une entreprise pour pr\u00E9visualiser son planning avant impression." }))] }), (0, jsx_runtime_1.jsx)("section", { className: `planning-shell panel planning-shell-v2 ${density}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "planning-scroll planning-scroll-v2", children: [(0, jsx_runtime_1.jsxs)("table", { className: "planning-table planning-table-v2", children: [(0, jsx_runtime_1.jsxs)("thead", { children: [(0, jsx_runtime_1.jsxs)("tr", { className: "planning-groups-row-v2", children: [(0, jsx_runtime_1.jsxs)("th", { className: "project-sticky-head", rowSpan: 2, children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantier" }), (0, jsx_runtime_1.jsx)("small", { children: "Avancement g\u00E9n\u00E9ral" })] }), groupedStages.map(({ group, stages }) => ((0, jsx_runtime_1.jsx)("th", { className: `group-heading-v2 group-${group.replace(/[^a-zA-Z]/g, '').toLowerCase()}`, colSpan: stages.length, children: group }, group)))] }), (0, jsx_runtime_1.jsx)("tr", { className: "planning-stage-row-v2", children: stages_1.STAGES.map((stage, index) => ((0, jsx_runtime_1.jsx)("th", { className: "stage-heading-v2", title: stage.label, children: (0, jsx_runtime_1.jsx)("div", { className: "stage-heading-card", children: (0, jsx_runtime_1.jsx)("strong", { children: stage.label }) }) }, stage.id))) })] }), (0, jsx_runtime_1.jsx)("tbody", { children: filtered.map((project) => {
                                        const progress = (0, planning_1.getProgress)(project);
                                        const currentStage = (0, planning_1.getCurrentStage)(project);
                                        return ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { className: "project-sticky-cell", children: (0, jsx_runtime_1.jsxs)("div", { className: "project-planning-card", children: [(0, jsx_runtime_1.jsxs)("div", { className: "project-planning-title", children: [(0, jsx_runtime_1.jsx)("strong", { children: project.name }), (0, jsx_runtime_1.jsxs)("span", { children: [progress, "%"] })] }), (0, jsx_runtime_1.jsxs)("p", { children: [project.city, " \u00B7 ", project.clientName] }), (0, jsx_runtime_1.jsx)("div", { className: "project-progress-v2", children: (0, jsx_runtime_1.jsx)("i", { style: { width: `${progress}%` } }) }), (0, jsx_runtime_1.jsxs)("small", { children: ["En cours : ", (0, planning_1.getStageLabel)(currentStage?.stageId)] })] }) }), stages_1.STAGES.map((definition) => {
                                                    const stage = project.stages.find((item) => item.stageId === definition.id) ?? { stageId: definition.id, status: 'todo' };
                                                    const artisanName = getArtisanPlanningCode(stage);
                                                    const scheduleState = (0, planning_1.getStageScheduleState)(stage);
                                                    const overdue = scheduleState?.status === 'late';
                                                    return ((0, jsx_runtime_1.jsx)("td", { className: "planning-cell-v2", children: (0, jsx_runtime_1.jsxs)("button", { className: `lot-card status-${stage.status} ${overdue ? 'is-overdue' : ''} ${scheduleState ? `schedule-${scheduleState.status}` : ''}`, onClick: () => openEditor(project, stage), title: stage.note ? `${definition.label} — ${stage.note}` : `Modifier ${definition.label}`, children: [(0, jsx_runtime_1.jsxs)("span", { className: "lot-card-topline", children: [(0, jsx_runtime_1.jsx)("span", { className: `lot-status status-${stage.status}`, children: (0, jsx_runtime_1.jsx)("span", { className: "lot-status-label", children: statusLabels[stage.status] }) }), overdue && (0, jsx_runtime_1.jsx)("em", { children: "Retard" })] }), (0, jsx_runtime_1.jsxs)("span", { className: `lot-date ${stage.plannedDate ? '' : 'empty'}`, children: [(0, jsx_runtime_1.jsx)("b", { children: "Date" }), " ", stage.plannedDate ? (0, planning_1.formatShortDate)(stage.plannedDate) : 'Date à définir', definition.id === 'map' && stage.plannedTime ? ` · ${stage.plannedTime}` : ''] }), !definition.dateOnly && ((0, jsx_runtime_1.jsxs)("span", { className: `lot-artisan ${artisanName ? '' : 'empty'}`, children: [(0, jsx_runtime_1.jsx)("b", { children: "Ent." }), " ", artisanName || 'Entreprise à renseigner'] })), scheduleState && (0, jsx_runtime_1.jsx)("span", { className: `lot-schedule ${scheduleState.status}`, children: scheduleState.label }), (0, jsx_runtime_1.jsx)("span", { className: "lot-edit-hint", children: "Modifier" })] }) }, definition.id));
                                                })] }, project.id));
                                    }) })] }), !filtered.length && (0, jsx_runtime_1.jsx)("div", { className: "empty-planning", children: projects.length ? 'Aucun chantier ne correspond aux filtres.' : 'Aucun chantier créé. Utilise le bouton « Nouveau chantier » pour commencer.' })] }) }), (0, jsx_runtime_1.jsxs)("section", { className: "artisan-print-sheet", "aria-hidden": "true", children: [(0, jsx_runtime_1.jsxs)("header", { className: "artisan-print-hero", children: [(0, jsx_runtime_1.jsx)("div", { className: "artisan-print-brand", children: (0, jsx_runtime_1.jsx)("img", { src: "./logo-arlogis.png", alt: "Maisons ARLOGIS" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-print-title", children: [(0, jsx_runtime_1.jsx)("small", { children: "CONDUCT'HOME \u00B7 PLANNING ENTREPRISE" }), (0, jsx_runtime_1.jsx)("h2", { children: selectedArtisan ? `Planning prévisionnel — ${selectedArtisan.company}` : 'Planning prévisionnel entreprise' }), (0, jsx_runtime_1.jsx)("p", { children: "Prochaines interventions programm\u00E9es sur les chantiers Maisons ARLOGIS." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "artisan-print-meta", children: [(0, jsx_runtime_1.jsx)("span", { children: "Date d'\u00E9dition" }), (0, jsx_runtime_1.jsx)("strong", { children: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }), (0, jsx_runtime_1.jsx)("small", { children: "Document \u00E0 transmettre \u00E0 l'entreprise" })] })] }), selectedArtisan && ((0, jsx_runtime_1.jsxs)("section", { className: "artisan-print-info", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprise" }), (0, jsx_runtime_1.jsx)("strong", { children: selectedArtisan.company }), (0, jsx_runtime_1.jsx)("small", { children: selectedArtisan.contactName || 'Contact non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E9l\u00E9phone" }), (0, jsx_runtime_1.jsx)("strong", { children: selectedArtisan.phone || '—' }), (0, jsx_runtime_1.jsx)("small", { children: selectedArtisan.email || 'E-mail non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Interventions \u00E0 venir" }), (0, jsx_runtime_1.jsx)("strong", { children: artisanPlanningRows.length }), (0, jsx_runtime_1.jsx)("small", { children: "hors \u00E9tapes termin\u00E9es" })] })] })), (0, jsx_runtime_1.jsxs)("table", { className: "artisan-print-table", children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { children: "Semaine" }), (0, jsx_runtime_1.jsx)("th", { children: "Chantier" }), (0, jsx_runtime_1.jsx)("th", { children: "Client" }), (0, jsx_runtime_1.jsx)("th", { children: "Adresse / ville" }), (0, jsx_runtime_1.jsx)("th", { children: "\u00C9tape" }), (0, jsx_runtime_1.jsx)("th", { children: "Statut" }), (0, jsx_runtime_1.jsx)("th", { children: "Note" })] }) }), (0, jsx_runtime_1.jsxs)("tbody", { children: [artisanPlanningRows.map((row) => row && ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("strong", { children: formatIsoWeek(row.plannedDate) }) }), (0, jsx_runtime_1.jsx)("td", { children: row.project.name }), (0, jsx_runtime_1.jsx)("td", { children: row.project.clientName }), (0, jsx_runtime_1.jsx)("td", { children: row.project.address ? `${row.project.address} · ${row.project.postalCode ?? ''} ${row.project.city}` : row.project.city }), (0, jsx_runtime_1.jsx)("td", { children: row.definition.label }), (0, jsx_runtime_1.jsx)("td", { children: (0, jsx_runtime_1.jsx)("span", { className: `artisan-print-status status-${row.stage.status}`, children: row.overdue ? 'En retard' : statusLabels[row.stage.status] }) }), (0, jsx_runtime_1.jsx)("td", { children: row.stage.note || '—' })] }, row.id))), selectedArtisan && artisanPlanningRows.length === 0 && ((0, jsx_runtime_1.jsx)("tr", { children: (0, jsx_runtime_1.jsx)("td", { colSpan: 7, className: "artisan-print-empty", children: "Aucune intervention future programm\u00E9e avec cette entreprise." }) }))] })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "artisan-print-footer", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Observations entreprise" }), (0, jsx_runtime_1.jsx)("span", {})] }), (0, jsx_runtime_1.jsx)("small", { children: "Planning indicatif g\u00E9n\u00E9r\u00E9 depuis Conduct'Home \u00B7 \u00C0 confirmer avec le conducteur de travaux" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "planning-print-sheet", "aria-hidden": "true", children: [(0, jsx_runtime_1.jsxs)("header", { className: "planning-print-hero", children: [(0, jsx_runtime_1.jsx)("div", { className: "planning-print-brand", children: (0, jsx_runtime_1.jsx)("img", { src: "./logo-arlogis.png", alt: "Maisons ARLOGIS" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "planning-print-title", children: [(0, jsx_runtime_1.jsx)("small", { children: "CONDUCT'HOME \u00B7 SUIVI OP\u00C9RATIONNEL" }), (0, jsx_runtime_1.jsx)("h2", { children: "Planning g\u00E9n\u00E9ral des chantiers" }), (0, jsx_runtime_1.jsx)("p", { children: "Dates d'intervention, entreprises affect\u00E9es et \u00E9tat d'avancement." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "planning-print-meta", children: [(0, jsx_runtime_1.jsx)("span", { children: "Date d'\u00E9dition" }), (0, jsx_runtime_1.jsx)("strong", { children: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) }), (0, jsx_runtime_1.jsx)("small", { children: "Format conseill\u00E9 : A3 paysage" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "planning-print-summary", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: printStats.projects }), (0, jsx_runtime_1.jsx)("span", { children: "Chantiers affich\u00E9s" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: printStats.completed }), (0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes termin\u00E9es" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "warning", children: [(0, jsx_runtime_1.jsx)("strong", { children: printStats.unplanned }), (0, jsx_runtime_1.jsx)("span", { children: "Dates \u00E0 planifier" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "danger", children: [(0, jsx_runtime_1.jsx)("strong", { children: printStats.late }), (0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes en retard" })] })] }), (0, jsx_runtime_1.jsxs)("table", { className: "planning-print-table", children: [(0, jsx_runtime_1.jsxs)("colgroup", { children: [(0, jsx_runtime_1.jsx)("col", { className: "print-project-col" }), stages_1.STAGES.map((stage) => (0, jsx_runtime_1.jsx)("col", { className: "print-stage-col" }, stage.id))] }), (0, jsx_runtime_1.jsxs)("thead", { children: [(0, jsx_runtime_1.jsxs)("tr", { className: "planning-print-groups", children: [(0, jsx_runtime_1.jsxs)("th", { className: "print-project-column", rowSpan: 2, children: [(0, jsx_runtime_1.jsx)("span", { children: "CHANTIER" }), (0, jsx_runtime_1.jsx)("small", { children: "Client \u00B7 ville \u00B7 avancement" })] }), groupedStages.map(({ group, stages }) => ((0, jsx_runtime_1.jsx)("th", { className: `print-group print-group-${printGroupClasses[group]}`, colSpan: stages.length, children: group }, group)))] }), (0, jsx_runtime_1.jsx)("tr", { className: "planning-print-stages", children: stages_1.STAGES.map((stage) => ((0, jsx_runtime_1.jsx)("th", { title: stage.label, children: (0, jsx_runtime_1.jsx)("div", { className: "print-stage-heading-content", children: (0, jsx_runtime_1.jsx)("strong", { children: stage.shortLabel }) }) }, stage.id))) })] }), (0, jsx_runtime_1.jsx)("tbody", { children: filtered.map((project) => {
                                    const progress = (0, planning_1.getProgress)(project);
                                    const currentStage = (0, planning_1.getCurrentStage)(project);
                                    return ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsxs)("td", { className: "print-project-cell", children: [(0, jsx_runtime_1.jsxs)("div", { className: "print-project-heading", children: [(0, jsx_runtime_1.jsx)("strong", { children: project.name }), (0, jsx_runtime_1.jsxs)("b", { children: [progress, "%"] })] }), (0, jsx_runtime_1.jsx)("span", { children: project.clientName }), (0, jsx_runtime_1.jsx)("small", { children: project.city || project.address || 'Adresse non renseignée' }), (0, jsx_runtime_1.jsx)("div", { className: "print-progress", children: (0, jsx_runtime_1.jsx)("i", { style: { width: `${progress}%` } }) }), (0, jsx_runtime_1.jsxs)("em", { children: ["En cours : ", (0, planning_1.getStageLabel)(currentStage?.stageId)] })] }), stages_1.STAGES.map((definition) => {
                                                const stage = project.stages.find((item) => item.stageId === definition.id) ?? { stageId: definition.id, status: 'todo' };
                                                const artisanName = getArtisanPlanningCode(stage);
                                                const scheduleState = (0, planning_1.getStageScheduleState)(stage);
                                                const overdue = scheduleState?.status === 'late';
                                                const displayDate = stage.status === 'done' ? (stage.actualDate || stage.plannedDate) : stage.plannedDate;
                                                return ((0, jsx_runtime_1.jsx)("td", { className: `print-stage-cell print-status-${stage.status} ${overdue ? 'print-overdue' : ''} ${scheduleState ? `print-schedule-${scheduleState.status}` : ''}`, children: (0, jsx_runtime_1.jsxs)("div", { className: "print-stage-content", title: stage.note || definition.label, children: [(0, jsx_runtime_1.jsx)("strong", { children: formatPrintDate(displayDate) }), !definition.dateOnly && (0, jsx_runtime_1.jsx)("small", { children: artisanName ? shortenCompanyForPrint(artisanName) : '—' })] }) }, definition.id));
                                            })] }, project.id));
                                }) })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "planning-print-footer", children: [(0, jsx_runtime_1.jsxs)("div", { className: "planning-print-legend", children: [(0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "done" }), " Termin\u00E9"] }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "progress" }), " En cours / planifi\u00E9"] }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "late" }), " En retard / bloqu\u00E9"] }), (0, jsx_runtime_1.jsxs)("span", { children: [(0, jsx_runtime_1.jsx)("i", { className: "todo" }), " \u00C0 planifier"] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "planning-print-signature", children: [(0, jsx_runtime_1.jsx)("span", { children: "Observations / visa :" }), (0, jsx_runtime_1.jsx)("i", {})] }), (0, jsx_runtime_1.jsx)("small", { children: "Document g\u00E9n\u00E9r\u00E9 depuis Conduct'Home \u00B7 Donn\u00E9es enregistr\u00E9es localement" })] })] }), (0, jsx_runtime_1.jsx)("p", { className: "planning-help planning-help-v2", children: "Clique sur une case pour renseigner les dates, le statut, l\u2019entreprise et une note. Les colonnes de pr\u00E9paration ne demandent aucune entreprise." }), editing && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: `${editing.project.name} — ${editingDefinition?.label ?? 'Étape'}`, onClose: () => setEditing(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "lot-editor-intro", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["\u00C9tape n\u00B0 ", String(stages_1.STAGES.findIndex((item) => item.id === editing.stage.stageId) + 1).padStart(2, '0')] }), (0, jsx_runtime_1.jsxs)("strong", { children: [editing.project.city, " \u00B7 ", editing.project.clientName] })] }), editingDefinition?.id === 'map' ? ((0, jsx_runtime_1.jsxs)("div", { className: "form-grid lot-editor-form map-editor-form", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Statut" }), (0, jsx_runtime_1.jsx)("select", { value: editing.stage.status, onChange: (event) => handleField('status', event.target.value), children: Object.entries(statusLabels).map(([value, label]) => (0, jsx_runtime_1.jsx)("option", { value: value, children: label }, value)) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: editing.stage.plannedDate ?? '', onChange: (event) => handleField('plannedDate', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Heure" }), (0, jsx_runtime_1.jsx)("input", { type: "time", value: editing.stage.plannedTime ?? '', onChange: (event) => handleField('plannedTime', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Note" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: editing.stage.note ?? '', onChange: (event) => handleField('note', event.target.value), placeholder: "Adresse du rendez-vous, personne \u00E0 rencontrer, \u00E9l\u00E9ments \u00E0 pr\u00E9parer\u2026" })] })] })) : ((0, jsx_runtime_1.jsxs)("div", { className: "form-grid lot-editor-form", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date d\u2019intervention pr\u00E9vue" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: editing.stage.plannedDate ?? '', onChange: (event) => handleField('plannedDate', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date d\u2019intervention r\u00E9elle" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: editing.stage.actualInterventionDate ?? '', onChange: (event) => handleField('actualInterventionDate', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Statut de l'\u00E9tape" }), (0, jsx_runtime_1.jsx)("select", { value: editing.stage.status, onChange: (event) => handleField('status', event.target.value), children: Object.entries(statusLabels).map(([value, label]) => (0, jsx_runtime_1.jsx)("option", { value: value, children: label }, value)) })] }), !editingDefinition?.dateOnly && ((0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Entreprise intervenante" }), (0, jsx_runtime_1.jsxs)("select", { value: editing.stage.artisanId ?? '', onChange: (event) => handleArtisanSelection(event.target.value), autoFocus: true, children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Aucune entreprise s\u00E9lectionn\u00E9e" }), eligibleArtisans.map((artisan) => (0, jsx_runtime_1.jsx)("option", { value: artisan.id, children: artisan.company }, artisan.id))] }), matchedLotNames.length > 0 ? ((0, jsx_runtime_1.jsxs)("small", { className: "field-help", children: ["\u00C9tape rattach\u00E9e au lot : ", matchedLotNames.join(', '), "."] })) : ((0, jsx_runtime_1.jsx)("small", { className: "field-help warning-help", children: "Cette \u00E9tape n\u2019est rattach\u00E9e \u00E0 aucun lot." }))] })), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date r\u00E9ellement termin\u00E9e" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: editing.stage.actualDate ?? '', onChange: (event) => handleField('actualDate', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Rappel avant intervention" }), (0, jsx_runtime_1.jsxs)("div", { className: "input-with-suffix", children: [(0, jsx_runtime_1.jsx)("input", { type: "number", min: "0", max: "60", value: editing.stage.notifyBeforeDays ?? 7, onChange: (event) => handleField('notifyBeforeDays', Number(event.target.value)) }), (0, jsx_runtime_1.jsx)("span", { children: "jours" })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Note pour cette \u00E9tape" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: editing.stage.note ?? '', onChange: (event) => handleField('note', event.target.value), placeholder: "Consigne, commande \u00E0 v\u00E9rifier, r\u00E9serve, num\u00E9ro de devis\u2026" })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "lot-editor-preview", children: [(0, jsx_runtime_1.jsx)("span", { children: "Aper\u00E7u" }), (0, jsx_runtime_1.jsx)("strong", { children: editing.stage.plannedDate ? `${(0, planning_1.formatDate)(editing.stage.plannedDate)}${editing.stage.plannedTime ? ` à ${editing.stage.plannedTime}` : ''}` : 'Date non définie' }), !editingDefinition?.dateOnly && (0, jsx_runtime_1.jsx)("small", { children: getArtisanName(editing.stage) || 'Aucune entreprise renseignée' }), (0, planning_1.getStageScheduleState)(editing.stage) && (0, jsx_runtime_1.jsx)("em", { className: `editor-schedule-state ${(0, planning_1.getStageScheduleState)(editing.stage)?.status}`, children: (0, planning_1.getStageScheduleState)(editing.stage)?.label })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions modal-actions-split", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button success-outline", onClick: markDone, children: "\u2713 Marquer termin\u00E9" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setEditing(null), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: save, disabled: saving, children: saving ? 'Enregistrement…' : "Enregistrer l'étape" })] })] })] }))] }));
}

},
"src/components/ProjectsView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsView = ProjectsView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const stages_1 = require("../data/stages");
const controlChecklist_1 = require("../data/controlChecklist");
const planning_1 = require("../lib/planning");
const Modal_1 = require("./Modal");
const projectSharing_1 = require("../lib/projectSharing");
const meetingPdf_1 = require("../lib/meetingPdf");
const emptyMeetingForm = {
    title: 'Réunion de chantier',
    meetingDate: new Date().toISOString().slice(0, 10),
    type: 'Réunion chantier',
    status: 'planned',
    stageId: '',
    notes: '',
};
const meetingStatusLabels = {
    planned: 'Prévue',
    done: 'Réalisée',
    cancelled: 'Annulée',
};
const statusLabels = {
    on_track: 'Dans les temps',
    warning: 'À surveiller',
    late: 'En retard',
    done: 'Terminé',
};
const clean = (value) => value?.trim() || undefined;
const phoneHref = (value) => `tel:${value.replace(/\s/g, '')}`;
function ProjectsView({ projects, documents, selectedProjectId, onSelect, onAddProject, onSaveProject, onArchiveProject, onRestoreProject, onOpenDocument, currentUserEmail, }) {
    const selectedFromAll = projects.find((project) => project.id === selectedProjectId);
    const [mode, setMode] = (0, react_1.useState)(selectedFromAll?.archivedAt ? 'archived' : 'active');
    const [editingProject, setEditingProject] = (0, react_1.useState)(null);
    const [archiveTarget, setArchiveTarget] = (0, react_1.useState)(null);
    const [archiveReason, setArchiveReason] = (0, react_1.useState)('');
    const [meetingForm, setMeetingForm] = (0, react_1.useState)(null);
    const [controlSearch, setControlSearch] = (0, react_1.useState)('');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const [openingDocumentId, setOpeningDocumentId] = (0, react_1.useState)();
    const [shareTarget, setShareTarget] = (0, react_1.useState)(null);
    const [shareEmail, setShareEmail] = (0, react_1.useState)('');
    const [shareMessage, setShareMessage] = (0, react_1.useState)();
    const activeProjects = (0, react_1.useMemo)(() => projects.filter((project) => !project.archivedAt), [projects]);
    const archivedProjects = (0, react_1.useMemo)(() => projects.filter((project) => Boolean(project.archivedAt)), [projects]);
    const visibleProjects = mode === 'active' ? activeProjects : archivedProjects;
    const selected = visibleProjects.find((project) => project.id === selectedProjectId) ?? visibleProjects[0];
    const selectedDocuments = (0, react_1.useMemo)(() => documents.filter((document) => document.projectId === selected?.id), [documents, selected?.id]);
    const selectedMeetings = (0, react_1.useMemo)(() => [...(selected?.meetings ?? [])].sort((a, b) => b.meetingDate.localeCompare(a.meetingDate)), [selected?.meetings]);
    const controlMap = (0, react_1.useMemo)(() => new Map((selected?.controlChecks ?? []).map((item) => [item.id, item])), [selected?.controlChecks]);
    const controlItems = (0, react_1.useMemo)(() => controlChecklist_1.CONTROL_CHECKLIST.flatMap((section) => section.items.map((item) => ({ ...item, sectionTitle: section.title }))), []);
    const controlItemIds = (0, react_1.useMemo)(() => new Set(controlItems.map((item) => item.id)), [controlItems]);
    const currentControlChecks = (0, react_1.useMemo)(() => selected?.controlChecks?.filter((item) => controlItemIds.has(item.id)) ?? [], [selected?.controlChecks, controlItemIds]);
    const controlDoneCount = (0, react_1.useMemo)(() => currentControlChecks.filter((item) => item.status === 'ok' || item.status === 'rework').length, [currentControlChecks]);
    const controlReworkCount = (0, react_1.useMemo)(() => currentControlChecks.filter((item) => item.status === 'rework').length, [currentControlChecks]);
    const controlNaCount = (0, react_1.useMemo)(() => currentControlChecks.filter((item) => item.status === 'na').length, [currentControlChecks]);
    const controlApplicableCount = Math.max(0, controlItems.length - controlNaCount);
    const controlProgress = controlApplicableCount ? Math.round((controlDoneCount / controlApplicableCount) * 100) : 0;
    (0, react_1.useEffect)(() => {
        if (!selectedFromAll)
            return;
        setMode(selectedFromAll.archivedAt ? 'archived' : 'active');
    }, [selectedFromAll?.id, selectedFromAll?.archivedAt]);
    (0, react_1.useEffect)(() => {
        if (selected || !visibleProjects[0])
            return;
        onSelect(visibleProjects[0].id);
    }, [selected, visibleProjects, onSelect]);
    const changeMode = (nextMode) => {
        setMode(nextMode);
        const first = nextMode === 'active' ? activeProjects[0] : archivedProjects[0];
        if (first)
            onSelect(first.id);
    };
    const updateEditingField = (key, value) => {
        setEditingProject((current) => current ? { ...current, [key]: value } : current);
    };
    const saveDetails = async () => {
        if (!editingProject)
            return;
        if (!editingProject.name.trim() || !editingProject.clientName.trim() || !editingProject.city.trim())
            return;
        setSaving(true);
        try {
            const updated = {
                ...editingProject,
                name: editingProject.name.trim().toUpperCase(),
                clientName: editingProject.clientName.trim(),
                city: editingProject.city.trim(),
                projectNumber: clean(editingProject.projectNumber),
                contractNumber: clean(editingProject.contractNumber),
                postalCode: clean(editingProject.postalCode),
                clientEmail: clean(editingProject.clientEmail),
                clientEmailSecondary: clean(editingProject.clientEmailSecondary),
                clientPhone: clean(editingProject.clientPhone),
                clientPhoneSecondary: clean(editingProject.clientPhoneSecondary),
                clientAddress: clean(editingProject.clientAddress),
                clientPostalCode: clean(editingProject.clientPostalCode),
                clientCity: clean(editingProject.clientCity),
                address: clean(editingProject.address),
                parcelReference: clean(editingProject.parcelReference),
                permitNumber: clean(editingProject.permitNumber),
                salesContact: clean(editingProject.salesContact),
                accessInstructions: clean(editingProject.accessInstructions),
                technicalNotes: clean(editingProject.technicalNotes),
                updatedAt: new Date().toISOString(),
            };
            await onSaveProject(updated);
            setEditingProject(null);
        }
        catch {
            // Le composant parent affiche le détail de l’erreur.
        }
        finally {
            setSaving(false);
        }
    };
    const confirmArchive = async () => {
        if (!archiveTarget)
            return;
        setSaving(true);
        try {
            await onArchiveProject(archiveTarget, archiveReason.trim() || undefined);
            setArchiveTarget(null);
            setArchiveReason('');
            setMode('archived');
        }
        catch {
            // Le composant parent affiche le détail de l’erreur.
        }
        finally {
            setSaving(false);
        }
    };
    const restoreProject = async (project) => {
        setSaving(true);
        try {
            await onRestoreProject(project);
            setMode('active');
        }
        catch {
            // Le composant parent affiche le détail de l’erreur.
        }
        finally {
            setSaving(false);
        }
    };
    const openDocument = async (document) => {
        setOpeningDocumentId(document.id);
        try {
            await onOpenDocument(document);
        }
        finally {
            setOpeningDocumentId(undefined);
        }
    };
    const startCreateMeeting = () => {
        const currentStageId = selected ? (0, planning_1.getCurrentStage)(selected)?.stageId ?? selected.stages.find((stage) => stage.status !== 'done')?.stageId ?? '' : '';
        setMeetingForm({
            ...emptyMeetingForm,
            meetingDate: new Date().toISOString().slice(0, 10),
            stageId: currentStageId,
        });
    };
    const startEditMeeting = (meeting) => {
        setMeetingForm({
            id: meeting.id,
            title: meeting.title,
            meetingDate: meeting.meetingDate,
            type: meeting.type,
            status: meeting.status,
            stageId: meeting.stageId ?? '',
            notes: meeting.notes ?? '',
            createdAt: meeting.createdAt,
        });
    };
    const saveMeeting = async () => {
        if (!selected || !meetingForm || !meetingForm.title.trim() || !meetingForm.meetingDate || !meetingForm.stageId)
            return;
        setSaving(true);
        try {
            const now = new Date().toISOString();
            const meeting = {
                id: meetingForm.id ?? `meeting-${crypto.randomUUID()}`,
                title: meetingForm.title.trim(),
                meetingDate: meetingForm.meetingDate,
                type: meetingForm.type.trim() || 'Réunion chantier',
                status: meetingForm.status,
                stageId: meetingForm.stageId,
                notes: clean(meetingForm.notes),
                createdAt: meetingForm.createdAt ?? now,
                updatedAt: now,
            };
            const meetings = selected.meetings ?? [];
            const updatedMeetings = meetings.some((item) => item.id === meeting.id)
                ? meetings.map((item) => item.id === meeting.id ? meeting : item)
                : [meeting, ...meetings];
            await onSaveProject({ ...selected, meetings: updatedMeetings, updatedAt: now });
            (0, meetingPdf_1.downloadMeetingReportPdf)({
                project: selected,
                meeting,
                stageLabel: (0, planning_1.getStageLabel)(meeting.stageId),
            });
            setMeetingForm(null);
        }
        catch {
            // Le parent affiche l'erreur.
        }
        finally {
            setSaving(false);
        }
    };
    const deleteMeeting = async (meetingId) => {
        if (!selected)
            return;
        setSaving(true);
        try {
            await onSaveProject({
                ...selected,
                meetings: (selected.meetings ?? []).filter((meeting) => meeting.id !== meetingId),
                updatedAt: new Date().toISOString(),
            });
        }
        catch {
            // Le parent affiche l'erreur.
        }
        finally {
            setSaving(false);
        }
    };
    const saveControlStatus = async (itemId, status) => {
        if (!selected)
            return;
        setSaving(true);
        try {
            const now = new Date().toISOString();
            const existing = selected.controlChecks ?? [];
            const updated = status
                ? [
                    ...existing.filter((item) => item.id !== itemId),
                    { id: itemId, status, checkedAt: now },
                ]
                : existing.filter((item) => item.id !== itemId);
            await onSaveProject({ ...selected, controlChecks: updated, updatedAt: now });
        }
        catch {
            // Le parent affiche l'erreur.
        }
        finally {
            setSaving(false);
        }
    };
    const getShareLink = () => shareTarget ? (0, projectSharing_1.createProjectShareLink)(shareTarget, currentUserEmail) : '';
    const copyShareLink = async () => {
        const link = getShareLink();
        if (!link)
            return;
        try {
            await navigator.clipboard.writeText(link);
            setShareMessage('Lien copié. Tu peux maintenant l’envoyer à la personne concernée.');
        }
        catch {
            const field = document.createElement('textarea');
            field.value = link;
            field.style.position = 'fixed';
            field.style.opacity = '0';
            document.body.appendChild(field);
            field.select();
            const copied = document.execCommand('copy');
            field.remove();
            setShareMessage(copied
                ? 'Lien copié.'
                : 'La copie automatique a été bloquée. Sélectionne le lien puis copie-le manuellement.');
        }
    };
    const openShareEmail = () => {
        if (!shareTarget)
            return;
        if (!shareEmail.trim()) {
            setShareMessage('Renseigne l’adresse e-mail du destinataire.');
            return;
        }
        const link = getShareLink();
        const subject = `Partage du chantier ${shareTarget.name}`;
        const body = [
            'Bonjour,',
            '',
            `Je te partage le chantier ${shareTarget.name}${shareTarget.city ? ` à ${shareTarget.city}` : ''}.`,
            '',
            'Ouvre le lien ci-dessous puis connecte-toi à Conduct’Home pour importer le chantier :',
            link,
            '',
            'Cordialement,',
        ].join('\n');
        window.location.href = `mailto:${encodeURIComponent(shareEmail.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Dossiers clients" }), (0, jsx_runtime_1.jsx)("h1", { children: "Chantiers" })] }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: onAddProject, children: "+ Nouveau chantier" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "project-mode-switch panel", role: "tablist", "aria-label": "Type de dossiers", children: [(0, jsx_runtime_1.jsxs)("button", { className: mode === 'active' ? 'active' : '', onClick: () => changeMode('active'), children: ["Chantiers actifs ", (0, jsx_runtime_1.jsx)("span", { children: activeProjects.length })] }), (0, jsx_runtime_1.jsxs)("button", { className: mode === 'archived' ? 'active' : '', onClick: () => changeMode('archived'), children: ["Archives ", (0, jsx_runtime_1.jsx)("span", { children: archivedProjects.length })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "split-layout project-folder-layout", children: [(0, jsx_runtime_1.jsxs)("aside", { className: "panel project-list-panel", children: [(0, jsx_runtime_1.jsx)("div", { className: "panel-header", children: (0, jsx_runtime_1.jsx)("h2", { children: mode === 'active' ? `${activeProjects.length} chantiers actifs` : `${archivedProjects.length} dossiers archivés` }) }), (0, jsx_runtime_1.jsxs)("div", { className: "project-list", children: [visibleProjects.map((project) => ((0, jsx_runtime_1.jsxs)("button", { className: selected?.id === project.id ? 'project-list-item active' : 'project-list-item', onClick: () => onSelect(project.id), children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: project.name }), (0, jsx_runtime_1.jsxs)("span", { children: [project.projectNumber ? `${project.projectNumber} · ` : '', project.city] })] }), project.archivedAt ? (0, jsx_runtime_1.jsx)("b", { className: "archive-list-label", children: "Archiv\u00E9" }) : (0, jsx_runtime_1.jsxs)("b", { children: [(0, planning_1.getProgress)(project), "%"] })] }, project.id))), !visibleProjects.length && ((0, jsx_runtime_1.jsxs)("div", { className: "project-list-empty", children: [(0, jsx_runtime_1.jsx)("strong", { children: mode === 'active' ? 'Aucun chantier actif' : 'Aucune archive' }), (0, jsx_runtime_1.jsx)("span", { children: mode === 'active' ? 'Crée ton premier chantier pour alimenter le planning.' : 'Les chantiers archivés apparaîtront ici.' })] }))] })] }), selected && ((0, jsx_runtime_1.jsxs)("article", { className: "panel project-detail-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: `project-detail-hero ${selected.archivedAt ? 'archived' : ''}`, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: `status-pill ${selected.archivedAt ? 'archived' : selected.status}`, children: selected.archivedAt ? 'Dossier archivé' : statusLabels[selected.status] }), (0, jsx_runtime_1.jsx)("h2", { children: selected.name }), (0, jsx_runtime_1.jsxs)("p", { children: [selected.clientName, " \u00B7 ", selected.postalCode ? `${selected.postalCode} ` : '', selected.city] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "project-hero-actions", children: [!selected.archivedAt && (0, jsx_runtime_1.jsxs)("strong", { className: "hero-progress", children: [(0, planning_1.getProgress)(selected), "%"] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "secondary-button light-button share-project-button", onClick: () => { setShareTarget(selected); setShareEmail(''); setShareMessage(undefined); }, children: "Partager" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button light-button", onClick: () => setEditingProject({ ...selected }), children: "Modifier le dossier" }), selected.archivedAt ? ((0, jsx_runtime_1.jsx)("button", { className: "secondary-button restore-button", disabled: saving, onClick: () => void restoreProject(selected), children: saving ? 'Restauration…' : 'Restaurer' })) : ((0, jsx_runtime_1.jsx)("button", { className: "secondary-button archive-button", onClick: () => { setArchiveTarget(selected); setArchiveReason(''); }, children: "Archiver" }))] })] }), !selected.archivedAt && (0, jsx_runtime_1.jsx)("div", { className: "large-progress", children: (0, jsx_runtime_1.jsx)("span", { style: { width: `${(0, planning_1.getProgress)(selected)}%` } }) }), selected.archivedAt && ((0, jsx_runtime_1.jsxs)("div", { className: "archive-summary", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Archiv\u00E9 le" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, planning_1.formatDate)(selected.archivedAt) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Motif / note" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.archiveReason || 'Aucun motif renseigné' })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "folder-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "folder-section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Coordonn\u00E9es" }), (0, jsx_runtime_1.jsx)("h3", { children: "Client" })] }), (0, jsx_runtime_1.jsx)("button", { className: "text-button", onClick: () => setEditingProject({ ...selected }), children: "Modifier" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du client" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.clientName })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E9l\u00E9phone principal" }), selected.clientPhone ? (0, jsx_runtime_1.jsx)("a", { href: phoneHref(selected.clientPhone), children: selected.clientPhone }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Second t\u00E9l\u00E9phone" }), selected.clientPhoneSecondary ? (0, jsx_runtime_1.jsx)("a", { href: phoneHref(selected.clientPhoneSecondary), children: selected.clientPhoneSecondary }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail principal" }), selected.clientEmail ? (0, jsx_runtime_1.jsx)("a", { href: `mailto:${selected.clientEmail}`, children: selected.clientEmail }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Second e-mail" }), selected.clientEmailSecondary ? (0, jsx_runtime_1.jsx)("a", { href: `mailto:${selected.clientEmailSecondary}`, children: selected.clientEmailSecondary }) : (0, jsx_runtime_1.jsx)("strong", { children: "Non renseign\u00E9" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card wide", children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse actuelle du client" }), (0, jsx_runtime_1.jsx)("strong", { children: [selected.clientAddress, selected.clientPostalCode, selected.clientCity].filter(Boolean).join(', ') || 'Non renseignée' })] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "folder-section muted-section", children: [(0, jsx_runtime_1.jsx)("div", { className: "folder-section-heading", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Op\u00E9ration" }), (0, jsx_runtime_1.jsx)("h3", { children: "Informations chantier" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card-grid", children: [(0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "N\u00B0 de dossier" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.projectNumber || 'Non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "N\u00B0 de contrat" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.contractNumber || 'Non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Permis de construire" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.permitNumber || 'Non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Parcelle / cadastre" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.parcelReference || 'Non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card wide", children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse du chantier" }), (0, jsx_runtime_1.jsx)("strong", { children: [selected.address, selected.postalCode, selected.city].filter(Boolean).join(', ') || 'Non renseignée' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Ouverture chantier" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, planning_1.formatDate)(selected.startDate) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "R\u00E9ception cible" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, planning_1.formatDate)(selected.targetEndDate) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Commercial / contact interne" }), (0, jsx_runtime_1.jsx)("strong", { children: selected.salesContact || 'Non renseigné' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "detail-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Nombre de lots" }), (0, jsx_runtime_1.jsx)("strong", { children: stages_1.STAGES.length })] })] })] }), (selected.accessInstructions || selected.technicalNotes) && ((0, jsx_runtime_1.jsxs)("div", { className: "folder-section", children: [(0, jsx_runtime_1.jsx)("div", { className: "folder-section-heading", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Terrain" }), (0, jsx_runtime_1.jsx)("h3", { children: "Consignes et notes" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "notes-grid", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Acc\u00E8s / cl\u00E9s / contraintes" }), (0, jsx_runtime_1.jsx)("p", { children: selected.accessInstructions || 'Aucune consigne.' })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Notes techniques" }), (0, jsx_runtime_1.jsx)("p", { children: selected.technicalNotes || 'Aucune note.' })] })] })] })), !selected.archivedAt && ((0, jsx_runtime_1.jsxs)("div", { className: "folder-section muted-section", children: [(0, jsx_runtime_1.jsx)("div", { className: "folder-section-heading", children: (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Suivi" }), (0, jsx_runtime_1.jsx)("h3", { children: "Avancement" })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "current-next-grid compact-current-next", children: [(0, jsx_runtime_1.jsxs)("div", { className: "current-stage-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tape en cours" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, planning_1.getStageLabel)((0, planning_1.getCurrentStage)(selected)?.stageId) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "next-stage-card", children: [(0, jsx_runtime_1.jsx)("span", { children: "Prochaine \u00E9tape" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, planning_1.getStageLabel)((0, planning_1.getNextStage)(selected)?.stageId) })] })] })] })), (0, jsx_runtime_1.jsxs)("div", { className: "folder-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "folder-section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Client" }), (0, jsx_runtime_1.jsx)("h3", { children: "R\u00E9unions de chantier" })] }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: startCreateMeeting, children: "+ Ajouter une r\u00E9union" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "meeting-list", children: [selectedMeetings.map((meeting) => ((0, jsx_runtime_1.jsxs)("article", { className: `meeting-card status-${meeting.status}`, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: meeting.type }), (0, jsx_runtime_1.jsx)("strong", { children: meeting.title }), (0, jsx_runtime_1.jsxs)("small", { children: [(0, planning_1.formatDate)(meeting.meetingDate), " \u00B7 ", meetingStatusLabels[meeting.status], " \u00B7 \u00C9tape : ", (0, planning_1.getStageLabel)(meeting.stageId)] }), meeting.notes && (0, jsx_runtime_1.jsx)("p", { children: meeting.notes })] }), (0, jsx_runtime_1.jsxs)("div", { className: "meeting-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "text-button", onClick: () => startEditMeeting(meeting), children: "\u00C9diter" }), (0, jsx_runtime_1.jsx)("button", { className: "text-button danger-text", disabled: saving, onClick: () => void deleteMeeting(meeting.id), children: "Supprimer" })] })] }, meeting.id))), !selectedMeetings.length && ((0, jsx_runtime_1.jsxs)("button", { className: "meeting-empty", onClick: startCreateMeeting, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Aucune r\u00E9union enregistr\u00E9e." }), (0, jsx_runtime_1.jsx)("span", { children: "Ajoute ici tes r\u00E9unions client, visites chantier et points de validation." })] }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "folder-section muted-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "folder-section-heading control-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Contr\u00F4le qualit\u00E9" }), (0, jsx_runtime_1.jsx)("h3", { children: "Carnet de contr\u00F4le interactif" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control-progress", children: [(0, jsx_runtime_1.jsxs)("strong", { children: [controlProgress, "%"] }), (0, jsx_runtime_1.jsxs)("span", { children: [controlDoneCount, "/", controlApplicableCount, " points applicables contr\u00F4l\u00E9s \u00B7 ", controlReworkCount, " reprise(s)", controlNaCount ? ` · ${controlNaCount} N/A` : ''] })] })] }), (0, jsx_runtime_1.jsx)("div", { className: "control-toolbar", children: (0, jsx_runtime_1.jsx)("input", { value: controlSearch, onChange: (event) => setControlSearch(event.target.value), placeholder: "Rechercher un point de contr\u00F4le\u2026" }) }), (0, jsx_runtime_1.jsx)("div", { className: "control-checklist", children: controlChecklist_1.CONTROL_CHECKLIST.map((section) => {
                                            const query = controlSearch.trim().toLowerCase();
                                            const visibleItems = section.items.filter((item) => !query || `${section.title} ${item.label}`.toLowerCase().includes(query));
                                            if (!visibleItems.length)
                                                return null;
                                            const sectionDone = section.items.filter((item) => {
                                                const status = controlMap.get(item.id)?.status;
                                                return status === 'ok' || status === 'rework';
                                            }).length;
                                            const sectionNa = section.items.filter((item) => controlMap.get(item.id)?.status === 'na').length;
                                            const sectionApplicable = Math.max(0, section.items.length - sectionNa);
                                            return ((0, jsx_runtime_1.jsxs)("details", { className: "control-section", children: [(0, jsx_runtime_1.jsxs)("summary", { children: [(0, jsx_runtime_1.jsx)("span", { children: section.title }), (0, jsx_runtime_1.jsxs)("small", { children: [sectionDone, "/", sectionApplicable, sectionNa ? ` · ${sectionNa} N/A` : ''] })] }), (0, jsx_runtime_1.jsx)("div", { children: visibleItems.map((item) => {
                                                            const entry = controlMap.get(item.id);
                                                            return ((0, jsx_runtime_1.jsxs)("article", { className: `control-row ${entry?.status ?? ''}`, children: [(0, jsx_runtime_1.jsxs)("span", { className: "control-item-copy", children: [(0, jsx_runtime_1.jsxs)("span", { className: "control-item-title", children: [item.critical && (0, jsx_runtime_1.jsx)("b", { className: "control-critical-badge", children: "Point cl\u00E9" }), (0, jsx_runtime_1.jsx)("strong", { children: item.label })] }), item.hint && (0, jsx_runtime_1.jsx)("small", { children: item.hint })] }), (0, jsx_runtime_1.jsxs)("div", { className: "control-row-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: entry?.status === 'ok' ? 'active ok' : 'ok', disabled: saving, onClick: () => void saveControlStatus(item.id, entry?.status === 'ok' ? undefined : 'ok'), children: "OK" }), (0, jsx_runtime_1.jsx)("button", { className: entry?.status === 'rework' ? 'active rework' : 'rework', disabled: saving, onClick: () => void saveControlStatus(item.id, entry?.status === 'rework' ? undefined : 'rework'), children: "\u00C0 reprendre" }), (0, jsx_runtime_1.jsx)("button", { className: entry?.status === 'na' ? 'active na' : 'na', disabled: saving, onClick: () => void saveControlStatus(item.id, entry?.status === 'na' ? undefined : 'na'), children: "N/A" }), (0, jsx_runtime_1.jsx)("small", { children: entry?.checkedAt ? (0, planning_1.formatDate)(entry.checkedAt) : '—' })] })] }, item.id));
                                                        }) })] }, section.id));
                                        }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "folder-section", children: [(0, jsx_runtime_1.jsxs)("div", { className: "folder-section-heading", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Pi\u00E8ces du dossier" }), (0, jsx_runtime_1.jsx)("h3", { children: "Documents conserv\u00E9s" })] }), (0, jsx_runtime_1.jsxs)("span", { className: "document-count-chip", children: [selectedDocuments.length, " fichier", selectedDocuments.length > 1 ? 's' : ''] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "project-document-list", children: [selectedDocuments.map((document) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => void openDocument(document), disabled: openingDocumentId === document.id, children: [(0, jsx_runtime_1.jsx)("span", { children: document.category }), (0, jsx_runtime_1.jsx)("strong", { children: document.name }), (0, jsx_runtime_1.jsx)("small", { children: openingDocumentId === document.id ? 'Ouverture…' : `${(0, planning_1.formatDate)(document.uploadedAt)} · ${document.sizeLabel}` })] }, document.id))), !selectedDocuments.length && (0, jsx_runtime_1.jsx)("p", { className: "empty-state", children: "Aucun document enregistr\u00E9 dans ce dossier." })] })] })] }))] }), meetingForm && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: meetingForm.id ? 'Modifier la réunion' : 'Ajouter une réunion', onClose: () => setMeetingForm(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Titre *" }), (0, jsx_runtime_1.jsx)("input", { value: meetingForm.title, onChange: (event) => setMeetingForm({ ...meetingForm, title: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: meetingForm.meetingDate, onChange: (event) => setMeetingForm({ ...meetingForm, meetingDate: event.target.value }) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Type" }), (0, jsx_runtime_1.jsx)("input", { value: meetingForm.type, onChange: (event) => setMeetingForm({ ...meetingForm, type: event.target.value }), placeholder: "R\u00E9union chantier, visite client\u2026" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Statut" }), (0, jsx_runtime_1.jsxs)("select", { value: meetingForm.status, onChange: (event) => setMeetingForm({ ...meetingForm, status: event.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "planned", children: "Pr\u00E9vue" }), (0, jsx_runtime_1.jsx)("option", { value: "done", children: "R\u00E9alis\u00E9e" }), (0, jsx_runtime_1.jsx)("option", { value: "cancelled", children: "Annul\u00E9e" })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tape du chantier *" }), (0, jsx_runtime_1.jsxs)("select", { value: meetingForm.stageId, onChange: (event) => setMeetingForm({ ...meetingForm, stageId: event.target.value }), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Choisir l\u2019\u00E9tape concern\u00E9e" }), stages_1.STAGES.map((stage) => (0, jsx_runtime_1.jsx)("option", { value: stage.id, children: stage.label }, stage.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Notes / compte rendu" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 6, value: meetingForm.notes, onChange: (event) => setMeetingForm({ ...meetingForm, notes: event.target.value }), placeholder: "Points vus avec le client, d\u00E9cisions, r\u00E9serves, prochaines actions\u2026" })] }), (0, jsx_runtime_1.jsx)("p", { className: "form-note meeting-pdf-note", children: "\u00C0 l\u2019enregistrement, un compte rendu A4 au format PDF sera automatiquement t\u00E9l\u00E9charg\u00E9." })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setMeetingForm(null), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: saving, onClick: () => void saveMeeting(), children: saving ? 'Enregistrement…' : 'Enregistrer' })] })] })), shareTarget && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: `Partager — ${shareTarget.name}`, onClose: () => setShareTarget(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "share-project-sheet", children: [(0, jsx_runtime_1.jsxs)("div", { className: "share-project-intro", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Partager une copie du chantier" }), (0, jsx_runtime_1.jsx)("span", { children: "La personne recevra un lien lui permettant d\u2019importer le planning, les dates, les statuts, les coordonn\u00E9es et les notes dans son propre compte Conduct\u2019Home." })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse e-mail du destinataire" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: shareEmail, onChange: (event) => setShareEmail(event.target.value), placeholder: "collaborateur@entreprise.fr" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Lien de partage" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: getShareLink(), readOnly: true, onFocus: (event) => event.currentTarget.select() })] }), (0, jsx_runtime_1.jsx)("p", { className: "share-project-warning", children: "Les documents enregistr\u00E9s uniquement sur ton ordinateur ne sont pas inclus. Le dossier chantier et son planning sont bien partag\u00E9s." }), shareMessage && (0, jsx_runtime_1.jsx)("p", { className: "share-project-message", children: shareMessage })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setShareTarget(null), children: "Fermer" }), (0, jsx_runtime_1.jsx)("span", { className: "modal-action-spacer" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => void copyShareLink(), children: "Copier le lien" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: openShareEmail, children: "Pr\u00E9parer l\u2019e-mail" })] })] })), editingProject && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: `Modifier le dossier ${editingProject.name}`, onClose: () => setEditingProject(null), wide: true, children: [(0, jsx_runtime_1.jsxs)("div", { className: "project-edit-scroll", children: [(0, jsx_runtime_1.jsxs)("div", { className: "form-section-title", children: [(0, jsx_runtime_1.jsx)("span", { children: "01" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Identification du chantier" }), (0, jsx_runtime_1.jsx)("small", { children: "R\u00E9f\u00E9rences internes et adresse de construction." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du chantier *" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.name, onChange: (event) => updateEditingField('name', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "N\u00B0 de dossier" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.projectNumber ?? '', onChange: (event) => updateEditingField('projectNumber', event.target.value), placeholder: "Ex. 2026-014" })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "N\u00B0 de contrat" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.contractNumber ?? '', onChange: (event) => updateEditingField('contractNumber', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Statut" }), (0, jsx_runtime_1.jsx)("select", { value: editingProject.status, onChange: (event) => updateEditingField('status', event.target.value), children: Object.entries(statusLabels).map(([value, label]) => (0, jsx_runtime_1.jsx)("option", { value: value, children: label }, value)) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse du chantier" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.address ?? '', onChange: (event) => updateEditingField('address', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Code postal" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.postalCode ?? '', onChange: (event) => updateEditingField('postalCode', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Ville *" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.city, onChange: (event) => updateEditingField('city', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Parcelle / r\u00E9f\u00E9rence cadastrale" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.parcelReference ?? '', onChange: (event) => updateEditingField('parcelReference', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "N\u00B0 permis de construire" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.permitNumber ?? '', onChange: (event) => updateEditingField('permitNumber', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Date d\u2019ouverture" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: editingProject.startDate, onChange: (event) => updateEditingField('startDate', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "R\u00E9ception cible" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: editingProject.targetEndDate, onChange: (event) => updateEditingField('targetEndDate', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Commercial / contact interne" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.salesContact ?? '', onChange: (event) => updateEditingField('salesContact', event.target.value) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-section-title", children: [(0, jsx_runtime_1.jsx)("span", { children: "02" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Coordonn\u00E9es du client" }), (0, jsx_runtime_1.jsx)("small", { children: "Informations utiles pour les appels, rendez-vous et courriers." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Nom du client *" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.clientName, onChange: (event) => updateEditingField('clientName', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E9l\u00E9phone principal" }), (0, jsx_runtime_1.jsx)("input", { type: "tel", value: editingProject.clientPhone ?? '', onChange: (event) => updateEditingField('clientPhone', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Second t\u00E9l\u00E9phone" }), (0, jsx_runtime_1.jsx)("input", { type: "tel", value: editingProject.clientPhoneSecondary ?? '', onChange: (event) => updateEditingField('clientPhoneSecondary', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "E-mail principal" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: editingProject.clientEmail ?? '', onChange: (event) => updateEditingField('clientEmail', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Second e-mail" }), (0, jsx_runtime_1.jsx)("input", { type: "email", value: editingProject.clientEmailSecondary ?? '', onChange: (event) => updateEditingField('clientEmailSecondary', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Adresse actuelle du client" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.clientAddress ?? '', onChange: (event) => updateEditingField('clientAddress', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Code postal client" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.clientPostalCode ?? '', onChange: (event) => updateEditingField('clientPostalCode', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Ville du client" }), (0, jsx_runtime_1.jsx)("input", { value: editingProject.clientCity ?? '', onChange: (event) => updateEditingField('clientCity', event.target.value) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-section-title", children: [(0, jsx_runtime_1.jsx)("span", { children: "03" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Consignes de suivi" }), (0, jsx_runtime_1.jsx)("small", { children: "Tout ce que tu dois retrouver rapidement avant de partir sur site." })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "form-grid", children: [(0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Acc\u00E8s, cl\u00E9s, voisinage, contraintes" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: editingProject.accessInstructions ?? '', onChange: (event) => updateEditingField('accessInstructions', event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { className: "full-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Notes techniques / particuli\u00E8res" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 5, value: editingProject.technicalNotes ?? '', onChange: (event) => updateEditingField('technicalNotes', event.target.value) })] })] })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setEditingProject(null), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", disabled: saving || !editingProject.name.trim() || !editingProject.clientName.trim() || !editingProject.city.trim(), onClick: () => void saveDetails(), children: saving ? 'Enregistrement…' : 'Enregistrer le dossier' })] })] })), archiveTarget && ((0, jsx_runtime_1.jsxs)(Modal_1.Modal, { title: `Archiver ${archiveTarget.name}`, onClose: () => setArchiveTarget(null), children: [(0, jsx_runtime_1.jsxs)("div", { className: "archive-confirmation", children: [(0, jsx_runtime_1.jsx)("span", { className: "archive-confirmation-icon", children: "\u2301" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Le chantier dispara\u00EEtra du planning et du tableau de bord." }), (0, jsx_runtime_1.jsx)("p", { children: "Les coordonn\u00E9es client, les dates, tous les lots et les documents resteront conserv\u00E9s dans l\u2019onglet Archives. Tu pourras restaurer le dossier \u00E0 tout moment." })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "modal-single-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Motif ou note d\u2019archivage (facultatif)" }), (0, jsx_runtime_1.jsx)("textarea", { rows: 4, value: archiveReason, onChange: (event) => setArchiveReason(event.target.value), placeholder: "Ex. Chantier r\u00E9ceptionn\u00E9 le\u2026, SAV \u00E0 suivre, dossier cl\u00F4tur\u00E9\u2026" })] }), (0, jsx_runtime_1.jsxs)("footer", { className: "modal-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setArchiveTarget(null), children: "Annuler" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button archive-primary-button", disabled: saving, onClick: () => void confirmArchive(), children: saving ? 'Archivage…' : 'Archiver le dossier' })] })] }))] }));
}

},
"src/components/Sidebar": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NAV_ITEMS = void 0;
exports.Sidebar = Sidebar;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
exports.NAV_ITEMS = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '' },
    { id: 'week', label: 'Semaine', icon: '' },
    { id: 'calendar', label: 'Calendrier', icon: '' },
    { id: 'tasks', label: 'Tâches', icon: '' },
    { id: 'planning', label: 'Planning', icon: '' },
    { id: 'projects', label: 'Chantiers', icon: '' },
    { id: 'documents', label: 'Documents', icon: '' },
    { id: 'orders', label: 'Commandes', icon: '' },
    { id: 'artisans', label: 'Artisans', icon: '' },
    { id: 'notifications', label: 'Alertes', icon: '' },
];
function Sidebar({ active, onChange, notificationCount, taskCount }) {
    const [mobileMenuOpen, setMobileMenuOpen] = (0, react_1.useState)(false);
    const items = exports.NAV_ITEMS;
    const activeItem = items.find((item) => item.id === active) ?? items[0];
    const selectView = (view) => {
        onChange(view);
        setMobileMenuOpen(false);
    };
    return ((0, jsx_runtime_1.jsxs)("aside", { className: "sidebar", children: [(0, jsx_runtime_1.jsxs)("div", { className: "brand brand-with-logo", children: [(0, jsx_runtime_1.jsx)("div", { className: "brand-logo-frame", children: (0, jsx_runtime_1.jsx)("img", { src: "./logo-arlogis.png", alt: "Maisons ARLOGIS", className: "brand-logo-image" }) }), (0, jsx_runtime_1.jsx)("span", { className: "brand-subtitle", children: "Pilotage chantier" })] }), (0, jsx_runtime_1.jsx)("nav", { className: "sidebar-nav", "aria-label": "Navigation principale", children: items.map((item) => ((0, jsx_runtime_1.jsxs)("button", { className: active === item.id ? 'nav-item active' : 'nav-item', onClick: () => selectView(item.id), children: [(0, jsx_runtime_1.jsx)("span", { className: "nav-icon", children: item.icon }), (0, jsx_runtime_1.jsx)("span", { children: item.label }), item.id === 'tasks' && taskCount > 0 && (0, jsx_runtime_1.jsx)("span", { className: "nav-badge task-nav-badge", children: taskCount }), item.id === 'notifications' && notificationCount > 0 && (0, jsx_runtime_1.jsx)("span", { className: "nav-badge", children: notificationCount })] }, item.id))) }), (0, jsx_runtime_1.jsxs)("div", { className: mobileMenuOpen ? 'mobile-tab-switcher open' : 'mobile-tab-switcher', children: [mobileMenuOpen && ((0, jsx_runtime_1.jsx)("div", { className: "mobile-tab-list", role: "menu", "aria-label": "Choisir un onglet", children: items.map((item) => ((0, jsx_runtime_1.jsxs)("button", { className: active === item.id ? 'mobile-tab-option active' : 'mobile-tab-option', onClick: () => selectView(item.id), role: "menuitem", children: [(0, jsx_runtime_1.jsx)("span", { children: item.label }), item.id === 'tasks' && taskCount > 0 && (0, jsx_runtime_1.jsx)("strong", { children: taskCount }), item.id === 'notifications' && notificationCount > 0 && (0, jsx_runtime_1.jsx)("strong", { children: notificationCount })] }, item.id))) })), (0, jsx_runtime_1.jsxs)("button", { className: "mobile-tab-current", onClick: () => setMobileMenuOpen((value) => !value), "aria-expanded": mobileMenuOpen, "aria-label": "Ouvrir la liste des onglets", children: [(0, jsx_runtime_1.jsx)("span", { children: activeItem.label }), (0, jsx_runtime_1.jsx)("b", { children: mobileMenuOpen ? 'Fermer' : 'Changer' })] })] })] }));
}

},
"src/components/TasksView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksView = TasksView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const priorityRank = {
    urgent: 0,
    high: 1,
    normal: 2,
};
function sortTasks(a, b) {
    const priorityDifference = priorityRank[a.priority] - priorityRank[b.priority];
    if (priorityDifference !== 0)
        return priorityDifference;
    if (a.dueDate && b.dueDate)
        return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate)
        return -1;
    if (b.dueDate)
        return 1;
    return b.createdAt.localeCompare(a.createdAt);
}
function formatTaskDate(value) {
    if (!value)
        return 'Sans échéance';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short' }).format(new Date(`${value}T12:00:00`));
}
function isLate(value) {
    if (!value)
        return false;
    return value < new Date().toISOString().slice(0, 10);
}
function TasksView({ projects, tasks, onCreate, onComplete, onDelete }) {
    const [title, setTitle] = (0, react_1.useState)('');
    const [details, setDetails] = (0, react_1.useState)('');
    const [dueDate, setDueDate] = (0, react_1.useState)('');
    const [priority, setPriority] = (0, react_1.useState)('normal');
    const [projectId, setProjectId] = (0, react_1.useState)('');
    const [saving, setSaving] = (0, react_1.useState)(false);
    const savingRef = (0, react_1.useRef)(false);
    const [completingIds, setCompletingIds] = (0, react_1.useState)([]);
    const activeTasks = (0, react_1.useMemo)(() => tasks.filter((task) => !task.completedAt).sort(sortTasks), [tasks]);
    const completedTasks = (0, react_1.useMemo)(() => tasks.filter((task) => task.completedAt).sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')), [tasks]);
    const addTask = async () => {
        if (!title.trim() || savingRef.current)
            return;
        savingRef.current = true;
        setSaving(true);
        try {
            await onCreate({
                title: title.trim(),
                details: details.trim() || undefined,
                dueDate: dueDate || undefined,
                priority,
                projectId: projectId || undefined,
            });
            setTitle('');
            setDetails('');
            setDueDate('');
            setPriority('normal');
            setProjectId('');
        }
        finally {
            savingRef.current = false;
            setSaving(false);
        }
    };
    const completeTask = (task) => {
        if (completingIds.includes(task.id))
            return;
        setCompletingIds((current) => [...current, task.id]);
        window.setTimeout(async () => {
            try {
                await onComplete(task);
            }
            finally {
                setCompletingIds((current) => current.filter((id) => id !== task.id));
            }
        }, 680);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack tasks-view", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Organisation personnelle" }), (0, jsx_runtime_1.jsx)("h1", { children: "Mes t\u00E2ches" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "task-count-chip", children: [(0, jsx_runtime_1.jsx)("strong", { children: activeTasks.length }), (0, jsx_runtime_1.jsx)("span", { children: "\u00E0 faire" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel task-create-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "task-create-main", children: [(0, jsx_runtime_1.jsxs)("label", { className: "task-title-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Nouvelle t\u00E2che" }), (0, jsx_runtime_1.jsx)("input", { value: title, onChange: (event) => setTitle(event.target.value), onKeyDown: (event) => { if (event.key === 'Enter')
                                            void addTask(); }, placeholder: "Ex. Relancer le couvreur pour le chantier Dupont", autoFocus: true })] }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button task-add-button", onClick: () => void addTask(), disabled: !title.trim() || saving, children: saving ? 'Ajout…' : '+ Ajouter la tâche' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "task-options-grid", children: [(0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Chantier associ\u00E9" }), (0, jsx_runtime_1.jsxs)("select", { value: projectId, onChange: (event) => setProjectId(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "", children: "Aucun chantier" }), projects.map((project) => (0, jsx_runtime_1.jsx)("option", { value: project.id, children: project.name }, project.id))] })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9ch\u00E9ance" }), (0, jsx_runtime_1.jsx)("input", { type: "date", value: dueDate, onChange: (event) => setDueDate(event.target.value) })] }), (0, jsx_runtime_1.jsxs)("label", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Priorit\u00E9" }), (0, jsx_runtime_1.jsxs)("select", { value: priority, onChange: (event) => setPriority(event.target.value), children: [(0, jsx_runtime_1.jsx)("option", { value: "normal", children: "Normale" }), (0, jsx_runtime_1.jsx)("option", { value: "high", children: "Importante" }), (0, jsx_runtime_1.jsx)("option", { value: "urgent", children: "Urgente" })] })] }), (0, jsx_runtime_1.jsxs)("label", { className: "task-details-field", children: [(0, jsx_runtime_1.jsx)("span", { children: "Pr\u00E9cision facultative" }), (0, jsx_runtime_1.jsx)("input", { value: details, onChange: (event) => setDetails(event.target.value), placeholder: "T\u00E9l\u00E9phone, information \u00E0 v\u00E9rifier\u2026" })] })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "panel task-list-panel", children: [(0, jsx_runtime_1.jsxs)("div", { className: "panel-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "Liste active" }), (0, jsx_runtime_1.jsx)("h2", { children: "\u00C0 faire" })] }), (0, jsx_runtime_1.jsx)("span", { className: "muted", children: "Clique sur le rond pour terminer une t\u00E2che" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "task-list", children: [!activeTasks.length && ((0, jsx_runtime_1.jsxs)("div", { className: "task-empty-state", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2713" }), (0, jsx_runtime_1.jsx)("strong", { children: "Tout est \u00E0 jour." }), (0, jsx_runtime_1.jsx)("p", { children: "Ajoute ta prochaine t\u00E2che avec le formulaire ci-dessus." })] })), activeTasks.map((task) => {
                                const project = projects.find((item) => item.id === task.projectId);
                                const completing = completingIds.includes(task.id);
                                return ((0, jsx_runtime_1.jsxs)("article", { className: `task-row priority-${task.priority}${completing ? ' completing' : ''}`, children: [(0, jsx_runtime_1.jsx)("button", { className: "task-check", onClick: () => completeTask(task), "aria-label": `Marquer ${task.title} comme terminée`, children: (0, jsx_runtime_1.jsx)("span", { children: "\u2713" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "task-row-content", children: [(0, jsx_runtime_1.jsxs)("div", { className: "task-row-title-line", children: [(0, jsx_runtime_1.jsx)("strong", { children: task.title }), task.priority !== 'normal' && (0, jsx_runtime_1.jsx)("span", { className: `task-priority ${task.priority}`, children: task.priority === 'urgent' ? 'Urgente' : 'Importante' })] }), task.details && (0, jsx_runtime_1.jsx)("p", { children: task.details }), (0, jsx_runtime_1.jsxs)("div", { className: "task-meta", children: [project && (0, jsx_runtime_1.jsxs)("span", { className: "task-project", children: ["\u2302 ", project.name] }), (0, jsx_runtime_1.jsxs)("span", { className: isLate(task.dueDate) ? 'task-date late' : 'task-date', children: ["\u25F7 ", formatTaskDate(task.dueDate)] })] })] }), (0, jsx_runtime_1.jsx)("button", { className: "task-delete-button", onClick: () => void onDelete(task), "aria-label": `Supprimer ${task.title}`, children: "\u00D7" })] }, task.id));
                            })] })] }), completedTasks.length > 0 && ((0, jsx_runtime_1.jsxs)("details", { className: "panel completed-tasks-panel", children: [(0, jsx_runtime_1.jsxs)("summary", { children: [(0, jsx_runtime_1.jsx)("span", { children: "T\u00E2ches termin\u00E9es" }), (0, jsx_runtime_1.jsx)("strong", { children: completedTasks.length })] }), (0, jsx_runtime_1.jsx)("div", { className: "completed-task-list", children: completedTasks.slice(0, 50).map((task) => ((0, jsx_runtime_1.jsxs)("article", { className: "completed-task-row", children: [(0, jsx_runtime_1.jsx)("span", { children: "\u2713" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: task.title }), (0, jsx_runtime_1.jsxs)("small", { children: ["Termin\u00E9e le ", new Intl.DateTimeFormat('fr-FR').format(new Date(task.completedAt))] })] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => void onDelete(task), children: "Supprimer" })] }, task.id))) })] }))] }));
}

},
"src/components/ViewErrorBoundary": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ViewErrorBoundary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
class ViewErrorBoundary extends react_1.Component {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: { failed: false }
        });
    }
    static getDerivedStateFromError() {
        return { failed: true };
    }
    componentDidCatch(error, info) {
        console.error('Erreur d’affichage Conduct’Home', error, info);
    }
    render() {
        if (!this.state.failed)
            return this.props.children;
        return ((0, jsx_runtime_1.jsxs)("section", { className: "panel view-error-state", children: [(0, jsx_runtime_1.jsx)("strong", { children: "Cette page n\u2019a pas pu s\u2019afficher." }), (0, jsx_runtime_1.jsx)("span", { children: "L\u2019application reste utilisable. Recharge la page pour r\u00E9essayer." }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", type: "button", onClick: () => window.location.reload(), children: "Recharger" })] }));
    }
}
exports.ViewErrorBoundary = ViewErrorBoundary;

},
"src/components/WeekView": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeekView = WeekView;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const stages_1 = require("../data/stages");
const planning_1 = require("../lib/planning");
const calendar_1 = require("../lib/calendar");
function formatDayLabel(date) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'short' }).format(date);
}
function WeekView({ projects, onOpenProject, onOpenPlanning }) {
    const [weekOffset, setWeekOffset] = (0, react_1.useState)(0);
    const weekStart = (0, react_1.useMemo)(() => {
        const monday = (0, calendar_1.startOfIsoWeek)();
        monday.setDate(monday.getDate() + weekOffset * 7);
        return monday;
    }, [weekOffset]);
    const days = (0, react_1.useMemo)(() => Array.from({ length: 5 }, (_, index) => (0, calendar_1.addDays)(weekStart, index)), [weekStart]);
    const dayIds = (0, react_1.useMemo)(() => days.map(calendar_1.localDateId), [days]);
    const weekItems = (0, react_1.useMemo)(() => {
        const todayId = (0, calendar_1.localDateId)();
        return projects.flatMap((project) => project.stages.flatMap((stage) => {
            if (!stage.plannedDate)
                return [];
            const definition = stages_1.STAGES.find((item) => item.id === stage.stageId);
            if (!definition)
                return [];
            const endDate = stage.status === 'in_progress'
                ? (stage.actualDate || todayId)
                : stage.plannedDate;
            return dayIds
                .filter((dateId) => dateId >= stage.plannedDate && dateId <= endDate)
                .map((dateId) => ({
                id: `${project.id}-${stage.stageId}-${dateId}`,
                date: dateId,
                project,
                stageLabel: definition.label,
                status: stage.status,
                note: stage.note,
            }));
        }));
    }, [projects, dayIds]);
    const printWeek = () => {
        const previousTitle = document.title;
        document.title = `Planning semaine ${(0, calendar_1.getIsoWeek)(weekStart)} - ARLOGIS`;
        window.print();
        window.setTimeout(() => { document.title = previousTitle; }, 600);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: "view-stack week-view", children: [(0, jsx_runtime_1.jsxs)("header", { className: "page-header", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { className: "eyebrow", children: "\u00C9tapes chantier" }), (0, jsx_runtime_1.jsxs)("h1", { children: ["Semaine ", (0, calendar_1.getIsoWeek)(weekStart)] }), (0, jsx_runtime_1.jsx)("p", { children: "Une vue rapide de ce qui se passe sur chaque chantier." })] }), (0, jsx_runtime_1.jsxs)("div", { className: "week-header-actions", children: [(0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setWeekOffset((value) => value - 1), children: "\u2190 Semaine pr\u00E9c\u00E9dente" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setWeekOffset(0), children: "Aujourd\u2019hui" }), (0, jsx_runtime_1.jsx)("button", { className: "secondary-button", onClick: () => setWeekOffset((value) => value + 1), children: "Semaine suivante \u2192" }), (0, jsx_runtime_1.jsx)("button", { className: "primary-button", onClick: printWeek, children: "\u2399 Imprimer / PDF" })] })] }), (0, jsx_runtime_1.jsxs)("section", { className: "week-summary panel week-summary-stages-only", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "Semaine" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, calendar_1.getIsoWeek)(weekStart) }), (0, jsx_runtime_1.jsxs)("small", { children: [(0, planning_1.formatDate)((0, calendar_1.localDateId)(days[0])), " \u2192 ", (0, planning_1.formatDate)((0, calendar_1.localDateId)(days[4]))] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("span", { children: "\u00C9tapes planifi\u00E9es" }), (0, jsx_runtime_1.jsx)("strong", { children: weekItems.length }), (0, jsx_runtime_1.jsx)("small", { children: "sur 5 jours" })] }), (0, jsx_runtime_1.jsx)("button", { onClick: onOpenPlanning, children: "Ouvrir le planning g\u00E9n\u00E9ral" })] }), (0, jsx_runtime_1.jsx)("section", { className: "week-grid", children: days.map((day) => {
                    const dateId = (0, calendar_1.localDateId)(day);
                    const dayItems = weekItems
                        .filter((item) => item.date === dateId)
                        .sort((left, right) => left.project.name.localeCompare(right.project.name, 'fr'));
                    return ((0, jsx_runtime_1.jsxs)("article", { className: "week-day-card panel", children: [(0, jsx_runtime_1.jsxs)("header", { children: [(0, jsx_runtime_1.jsx)("span", { children: formatDayLabel(day) }), (0, jsx_runtime_1.jsx)("strong", { children: dayItems.length })] }), (0, jsx_runtime_1.jsxs)("div", { className: "week-day-content", children: [dayItems.map((item) => ((0, jsx_runtime_1.jsx)("button", { className: `week-item intervention status-${item.status} compact week-stage-line`, onClick: () => onOpenProject(item.project.id), title: item.note || `${item.project.name} - ${item.stageLabel}`, children: (0, jsx_runtime_1.jsxs)("strong", { children: [item.project.name, " - ", item.stageLabel] }) }, item.id))), !dayItems.length && (0, jsx_runtime_1.jsx)("p", { className: "week-empty", children: "Aucune \u00E9tape planifi\u00E9e." })] })] }, dateId));
                }) })] }));
}

},
"src/data/controlChecklist": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONTROL_CHECKLIST = void 0;
exports.CONTROL_CHECKLIST = [
    {
        "id": "opening",
        "title": "01 — OUVERTURE / TERRASSEMENT",
        "stageId": "opening",
        "items": [
            {
                "id": "qc-opening-01",
                "label": "Implantation conforme au plan masse et aux limites",
                "hint": "Axes, retraits, orientation, dimensions et repères pérennes.",
                "critical": true
            },
            {
                "id": "qc-opening-02",
                "label": "Altimétrie de référence contrôlée avant terrassement",
                "hint": "Niveau fini, niveau plancher et évacuation des eaux.",
                "critical": true
            },
            {
                "id": "qc-opening-03",
                "label": "Décapage de la terre végétale correctement réalisé",
                "hint": "Stockage séparé et absence de terre organique sous l’ouvrage."
            },
            {
                "id": "qc-opening-04",
                "label": "Fouilles conformes en largeur, profondeur et portance",
                "hint": "Fond propre, homogène, non remanié et sans eau stagnante.",
                "critical": true
            },
            {
                "id": "qc-opening-05",
                "label": "Accès, sécurité et stabilité des terrassements maîtrisés",
                "hint": "Talutage, balisage, circulation engins et protection des tiers."
            },
            {
                "id": "qc-opening-06",
                "label": "Photos et relevés avant bétonnage archivés",
                "hint": "Implantation, fond de fouilles et points singuliers."
            }
        ]
    },
    {
        "id": "foundations",
        "title": "02 — FONDATIONS",
        "stageId": "foundations",
        "items": [
            {
                "id": "qc-foundations-01",
                "label": "Fond de fouille propre et conforme à l’étude de sol",
                "hint": "Pas de terre meuble, boue, eau ou surprofondeur non traitée.",
                "critical": true
            },
            {
                "id": "qc-foundations-02",
                "label": "Dimensions et niveaux des semelles contrôlés",
                "hint": "Largeur, hauteur, redans et profondeur hors gel selon dossier.",
                "critical": true
            },
            {
                "id": "qc-foundations-03",
                "label": "Armatures conformes, calées et correctement recouvertes",
                "hint": "Position, continuité, recouvrements, attentes et liaisons.",
                "critical": true
            },
            {
                "id": "qc-foundations-04",
                "label": "Passages de réseaux et attentes anticipés",
                "hint": "Éviter tout percement ultérieur non prévu."
            },
            {
                "id": "qc-foundations-05",
                "label": "Béton identifié, coulé sans ségrégation et correctement réparti",
                "hint": "Bon de livraison, conditions météo et continuité du coulage."
            },
            {
                "id": "qc-foundations-06",
                "label": "Cotes et photos avant recouvrement enregistrées",
                "hint": "Traçabilité des armatures, attentes et points singuliers."
            }
        ]
    },
    {
        "id": "vs_basement",
        "title": "03 — VIDE SANITAIRE / SOUS-SOL",
        "stageId": "vs_basement",
        "items": [
            {
                "id": "qc-vs-01",
                "label": "Implantation, dimensions et équerrage du soubassement",
                "hint": "Contrôler diagonales, axes et épaisseurs.",
                "critical": true
            },
            {
                "id": "qc-vs-02",
                "label": "Chaînages, poteaux et attentes correctement positionnés",
                "hint": "Continuité des armatures et liaison aux fondations.",
                "critical": true
            },
            {
                "id": "qc-vs-03",
                "label": "Arase étanche et coupure de capillarité réalisées",
                "hint": "Continuité, niveau et absence de rupture.",
                "critical": true
            },
            {
                "id": "qc-vs-04",
                "label": "Ventilation du vide sanitaire prévue et non obstruée",
                "hint": "Répartition des entrées d’air et protection contre les nuisibles."
            },
            {
                "id": "qc-vs-05",
                "label": "Accès au vide sanitaire praticable",
                "hint": "Trappe, hauteur utile et circulation vers les réseaux."
            },
            {
                "id": "qc-vs-06",
                "label": "Étanchéité et drainage du sous-sol réalisés si prévus",
                "hint": "Protection verticale, drain, exutoire et remblai adapté.",
                "critical": true
            }
        ]
    },
    {
        "id": "tubing",
        "title": "04 — TUBAGE / RÉSEAUX SOUS DALLE",
        "stageId": "tubing",
        "items": [
            {
                "id": "qc-tubing-01",
                "label": "Position des évacuations conforme aux plans",
                "hint": "Cuisine, sanitaires, buanderie, garage et attentes extérieures.",
                "critical": true
            },
            {
                "id": "qc-tubing-02",
                "label": "Pentes, diamètres et sens d’écoulement vérifiés",
                "hint": "Absence de contre-pente et raccords accessibles.",
                "critical": true
            },
            {
                "id": "qc-tubing-03",
                "label": "Fourreaux et gaines identifiés, protégés et obturés",
                "hint": "Électricité, télécom, eau, chauffage et équipements futurs."
            },
            {
                "id": "qc-tubing-04",
                "label": "Traversées de murs ou planchers correctement réservées",
                "hint": "Protection mécanique et traitement des points d’étanchéité."
            },
            {
                "id": "qc-tubing-05",
                "label": "Câblette ou prise de terre mise en place",
                "hint": "Continuité et sortie accessible avant recouvrement.",
                "critical": true
            },
            {
                "id": "qc-tubing-06",
                "label": "Essais d’écoulement et photos avant fermeture réalisés",
                "hint": "Tracer précisément les réseaux cachés."
            }
        ]
    },
    {
        "id": "floor_slab_pour",
        "title": "05 — COULAGE DU PLANCHER",
        "stageId": "floor_slab_pour",
        "items": [
            {
                "id": "qc-floor-01",
                "label": "Type de plancher et calepinage conformes au plan fabricant",
                "hint": "Poutrelles, entrevous, trémies, chevêtres et appuis.",
                "critical": true
            },
            {
                "id": "qc-floor-02",
                "label": "Étaiement stable, complet et correctement réglé",
                "hint": "Respect des files, appuis et délais de maintien.",
                "critical": true
            },
            {
                "id": "qc-floor-03",
                "label": "Armatures, treillis et chaînages correctement positionnés",
                "hint": "Recouvrements, cales, renforts et liaisons périphériques.",
                "critical": true
            },
            {
                "id": "qc-floor-04",
                "label": "Réservations, trémies et attentes contrôlées",
                "hint": "Escalier, gaines, conduits, réseaux et niveaux finis."
            },
            {
                "id": "qc-floor-05",
                "label": "Niveau, épaisseur et planéité avant coulage vérifiés",
                "hint": "Repères de niveau visibles et cohérents."
            },
            {
                "id": "qc-floor-06",
                "label": "Bétonnage, vibration et cure correctement réalisés",
                "hint": "Limiter ségrégation, dessiccation rapide et surcharge locale."
            }
        ]
    },
    {
        "id": "elevations",
        "title": "06 — ÉLÉVATIONS",
        "stageId": "elevations",
        "items": [
            {
                "id": "qc-elevations-01",
                "label": "Dimensions, aplomb, niveau et équerrage des murs",
                "hint": "Contrôler régulièrement pendant l’élévation.",
                "critical": true
            },
            {
                "id": "qc-elevations-02",
                "label": "Ouvertures conformes en position et dimensions",
                "hint": "Largeur, hauteur, allège, linteau et réservation de pose.",
                "critical": true
            },
            {
                "id": "qc-elevations-03",
                "label": "Chaînages horizontaux et verticaux continus",
                "hint": "Angles, refends, baies et liaisons avec planchers.",
                "critical": true
            },
            {
                "id": "qc-elevations-04",
                "label": "Appuis, seuils et coffres prévus aux bonnes altitudes",
                "hint": "Prendre en compte sols finis et type de menuiserie."
            },
            {
                "id": "qc-elevations-05",
                "label": "Réservations techniques et traversées anticipées",
                "hint": "VMC, évacuations, conduits, tableaux et équipements."
            },
            {
                "id": "qc-elevations-06",
                "label": "Arase supérieure prête à recevoir la charpente",
                "hint": "Niveau, planéité, ancrages et dimensions."
            }
        ]
    },
    {
        "id": "frame_delivery",
        "title": "07 — LIVRAISON CHARPENTE",
        "stageId": "frame_delivery",
        "items": [
            {
                "id": "qc-frame-delivery-01",
                "label": "Bon de livraison conforme à la commande",
                "hint": "Références, quantités, accessoires et plans fabricant."
            },
            {
                "id": "qc-frame-delivery-02",
                "label": "Éléments identifiés, complets et sans dégradation",
                "hint": "Signaler immédiatement casse, humidité ou déformation.",
                "critical": true
            },
            {
                "id": "qc-frame-delivery-03",
                "label": "Stockage à plat, ventilé et protégé du sol",
                "hint": "Éviter déformation, humidité et mélange des éléments."
            },
            {
                "id": "qc-frame-delivery-04",
                "label": "Moyens de levage et zone de pose sécurisés",
                "hint": "Accès grue, stabilité du terrain et balisage."
            }
        ]
    },
    {
        "id": "frame",
        "title": "08 — CHARPENTE",
        "stageId": "frame",
        "items": [
            {
                "id": "qc-frame-01",
                "label": "Pose conforme au plan de charpente fabricant",
                "hint": "Ordre, orientation, entraxes, appuis et repérage.",
                "critical": true
            },
            {
                "id": "qc-frame-02",
                "label": "Ancrages, fixations et liaisons correctement réalisés",
                "hint": "Sabots, équerres, scellements et fixations spécifiques.",
                "critical": true
            },
            {
                "id": "qc-frame-03",
                "label": "Contreventements, antiflambements et entretoises complets",
                "hint": "Aucun élément du plan fabricant ne doit manquer.",
                "critical": true
            },
            {
                "id": "qc-frame-04",
                "label": "Aplomb, alignement et déformations contrôlés",
                "hint": "Fermettes, pannes, chevrons et débords."
            },
            {
                "id": "qc-frame-05",
                "label": "Trémies et chevêtres conformes aux équipements",
                "hint": "Conduit, VMC, fenêtre de toit, trappe et accès."
            },
            {
                "id": "qc-frame-06",
                "label": "Bois protégés de l’humidité avant couverture",
                "hint": "Évacuer les eaux et éviter les stagnations."
            }
        ]
    },
    {
        "id": "roof",
        "title": "09 — COUVERTURE",
        "stageId": "roof",
        "items": [
            {
                "id": "qc-roof-01",
                "label": "Écran sous-toiture continu et correctement raccordé",
                "hint": "Recouvrements, rives, pénétrations et évacuation vers égout.",
                "critical": true
            },
            {
                "id": "qc-roof-02",
                "label": "Liteaux, contre-liteaux et ventilation sous couverture",
                "hint": "Entrées/sorties d’air et continuité de la lame ventilée."
            },
            {
                "id": "qc-roof-03",
                "label": "Calepinage, recouvrements et fixation des éléments",
                "hint": "Rives, égouts, faîtages, arêtiers et zones exposées.",
                "critical": true
            },
            {
                "id": "qc-roof-04",
                "label": "Noues et pénétrations traitées sans point de fuite",
                "hint": "Conduits, sorties, fenêtres de toit et raccords.",
                "critical": true
            },
            {
                "id": "qc-roof-05",
                "label": "Tuiles à douille et sorties positionnées selon plans",
                "hint": "VMC, ventilation primaire et autres équipements."
            },
            {
                "id": "qc-roof-06",
                "label": "Aspect final homogène et éléments endommagés remplacés",
                "hint": "Alignement, teinte, coupes et propreté."
            }
        ]
    },
    {
        "id": "zinc",
        "title": "10 — ZINGUERIE",
        "stageId": "zinc",
        "items": [
            {
                "id": "qc-zinc-01",
                "label": "Gouttières posées avec pente et supports réguliers",
                "hint": "Écoulement naturel sans contre-pente ni déformation."
            },
            {
                "id": "qc-zinc-02",
                "label": "Naissances, descentes et raccords étanches",
                "hint": "Assemblages, dilatation et fixation.",
                "critical": true
            },
            {
                "id": "qc-zinc-03",
                "label": "Solins, abergements et couvertines continus",
                "hint": "Raccords avec murs, conduits et équipements.",
                "critical": true
            },
            {
                "id": "qc-zinc-04",
                "label": "Rejets d’eau éloignés des façades et fondations",
                "hint": "Raccordement provisoire ou définitif des eaux pluviales."
            },
            {
                "id": "qc-zinc-05",
                "label": "Essai visuel d’écoulement réalisé",
                "hint": "Absence de fuite, débordement ou stagnation."
            }
        ]
    },
    {
        "id": "thresholds",
        "title": "11 — POSE DES SEUILS ET APPUIS",
        "stageId": "thresholds",
        "items": [
            {
                "id": "qc-thresholds-01",
                "label": "Références, dimensions et teintes conformes",
                "hint": "Comparer à la MAP et aux menuiseries commandées."
            },
            {
                "id": "qc-thresholds-02",
                "label": "Altimétrie compatible avec sols finis et accessibilité",
                "hint": "Portes, baies, terrasses et niveaux intérieurs.",
                "critical": true
            },
            {
                "id": "qc-thresholds-03",
                "label": "Pente, rejingot et évacuation d’eau corrects",
                "hint": "Éviter toute stagnation ou retour d’eau.",
                "critical": true
            },
            {
                "id": "qc-thresholds-04",
                "label": "Scellement stable et absence de fissure ou éclat",
                "hint": "Protection jusqu’à la pose des menuiseries."
            },
            {
                "id": "qc-thresholds-05",
                "label": "Largeurs de tableaux compatibles avec la pose",
                "hint": "Contrôler les jeux et les réservations périphériques."
            }
        ]
    },
    {
        "id": "pre_backfill",
        "title": "12 — PRÉ-REMBLAIS",
        "stageId": "pre_backfill",
        "items": [
            {
                "id": "qc-prebackfill-01",
                "label": "Étanchéité et protections des soubassements terminées",
                "hint": "Aucune zone ne doit être remblayée avant contrôle.",
                "critical": true
            },
            {
                "id": "qc-prebackfill-02",
                "label": "Réseaux enterrés contrôlés et photographiés",
                "hint": "Position, pente, profondeur, protection et repérage.",
                "critical": true
            },
            {
                "id": "qc-prebackfill-03",
                "label": "Matériau de remblai adapté et exempt de blocs agressifs",
                "hint": "Protection des murs, drains et canalisations."
            },
            {
                "id": "qc-prebackfill-04",
                "label": "Remblaiement réalisé par couches sans choc sur l’ouvrage",
                "hint": "Compactage maîtrisé à proximité des murs."
            },
            {
                "id": "qc-prebackfill-05",
                "label": "Pentes provisoires éloignent les eaux de la maison",
                "hint": "Éviter les poches d’eau contre les façades."
            }
        ]
    },
    {
        "id": "ext_joinery_delivery",
        "title": "13 — LIVRAISON MENUISERIES EXTÉRIEURES",
        "stageId": "ext_joinery_delivery",
        "items": [
            {
                "id": "qc-mext-delivery-01",
                "label": "Quantités, dimensions, sens et références vérifiés",
                "hint": "Comparer le bordereau, les plans et les repères de baies.",
                "critical": true
            },
            {
                "id": "qc-mext-delivery-02",
                "label": "Coloris, vitrages et accessoires conformes",
                "hint": "Poignées, volets, grilles, tapées et seuils."
            },
            {
                "id": "qc-mext-delivery-03",
                "label": "Absence de choc, rayure, casse ou déformation",
                "hint": "Émettre des réserves précises sur le bon de livraison."
            },
            {
                "id": "qc-mext-delivery-04",
                "label": "Stockage vertical, stable, sec et protégé",
                "hint": "Identifier chaque élément par baie."
            }
        ]
    },
    {
        "id": "ext_joinery",
        "title": "14 — MENUISERIES EXTÉRIEURES",
        "stageId": "ext_joinery",
        "items": [
            {
                "id": "qc-mext-01",
                "label": "Support, dimensions de baies et niveaux contrôlés",
                "hint": "Compatibilité avec seuils, appuis et tapées.",
                "critical": true
            },
            {
                "id": "qc-mext-02",
                "label": "Pose d’aplomb, de niveau et sans déformation",
                "hint": "Jeux réguliers et fonctionnement sans contrainte.",
                "critical": true
            },
            {
                "id": "qc-mext-03",
                "label": "Fixations adaptées et correctement réparties",
                "hint": "Aucune fixation insuffisante ou dans une zone fragile."
            },
            {
                "id": "qc-mext-04",
                "label": "Étanchéité périphérique continue",
                "hint": "Traitement intérieur, extérieur, angles et appuis.",
                "critical": true
            },
            {
                "id": "qc-mext-05",
                "label": "Ouvrants, serrures et volets testés",
                "hint": "Ouverture, fermeture, réglage, fins de course et commandes."
            },
            {
                "id": "qc-mext-06",
                "label": "Protections conservées et menuiseries sans dégradation",
                "hint": "Nettoyer les rails et protéger jusqu’aux finitions."
            }
        ]
    },
    {
        "id": "interior_joinery_delivery",
        "title": "15 — LIVRAISON MENUISERIES INTÉRIEURES",
        "stageId": "interior_joinery_delivery",
        "items": [
            {
                "id": "qc-mint-delivery-01",
                "label": "Quantités, dimensions et sens d’ouverture vérifiés",
                "hint": "Portes, huisseries, blocs-portes et équipements."
            },
            {
                "id": "qc-mint-delivery-02",
                "label": "Modèles, finitions et quincailleries conformes",
                "hint": "Poignées, serrures, butées et accessoires."
            },
            {
                "id": "qc-mint-delivery-03",
                "label": "Éléments secs, droits et sans choc",
                "hint": "Réserves sur livraison si besoin."
            },
            {
                "id": "qc-mint-delivery-04",
                "label": "Stockage à plat ou vertical selon fabricant",
                "hint": "Local sec, ventilé et protégé des travaux humides."
            }
        ]
    },
    {
        "id": "drywall_delivery",
        "title": "16 — LIVRAISON PLÂTRERIE",
        "stageId": "drywall_delivery",
        "items": [
            {
                "id": "qc-placo-delivery-01",
                "label": "Types et quantités de plaques conformes",
                "hint": "Standard, hydrofuge, feu, acoustique et épaisseurs."
            },
            {
                "id": "qc-placo-delivery-02",
                "label": "Ossatures, isolants et accessoires complets",
                "hint": "Rails, montants, suspentes, bandes, vis et renforts."
            },
            {
                "id": "qc-placo-delivery-03",
                "label": "Stockage au sec, à plat et sans déformation",
                "hint": "Protection contre humidité, chocs et circulation."
            },
            {
                "id": "qc-placo-delivery-04",
                "label": "Bâtiment suffisamment hors d’eau et ventilé",
                "hint": "Ne pas enfermer l’humidité dans les ouvrages."
            }
        ]
    },
    {
        "id": "drywall_first",
        "title": "17 — PLÂTRERIE 1ÈRE INTERVENTION",
        "stageId": "drywall_first",
        "items": [
            {
                "id": "qc-placo1-01",
                "label": "Implantation des cloisons conforme aux plans",
                "hint": "Dimensions des pièces, dégagements et réservations.",
                "critical": true
            },
            {
                "id": "qc-placo1-02",
                "label": "Ossatures droites, stables et correctement fixées",
                "hint": "Entraxes, doublages, plafonds et points singuliers."
            },
            {
                "id": "qc-placo1-03",
                "label": "Renforts prévus pour équipements et charges",
                "hint": "Meubles, sanitaires, mains courantes, radiateurs et TV."
            },
            {
                "id": "qc-placo1-04",
                "label": "Type de plaque adapté à chaque local",
                "hint": "Humidité, feu, acoustique et résistance mécanique."
            },
            {
                "id": "qc-placo1-05",
                "label": "Isolation continue, jointive et sans tassement",
                "hint": "Traitement des jonctions et absence de vide."
            },
            {
                "id": "qc-placo1-06",
                "label": "Réservations techniques coordonnées avec les autres lots",
                "hint": "Électricité, plomberie, VMC, chauffage et menuiseries."
            }
        ]
    },
    {
        "id": "electrical_octopus_delivery",
        "title": "18 — LIVRAISON PIEUVRE ÉLECTRIQUE",
        "stageId": "electrical_octopus_delivery",
        "items": [
            {
                "id": "qc-elec-pieuvre-01",
                "label": "Repérage de la pieuvre conforme au plan électrique",
                "hint": "Chaque départ doit être identifié et lisible."
            },
            {
                "id": "qc-elec-pieuvre-02",
                "label": "Longueurs, sections et accessoires contrôlés",
                "hint": "Comparer au dossier technique et aux options."
            },
            {
                "id": "qc-elec-pieuvre-03",
                "label": "Aucune gaine écrasée, coupée ou endommagée",
                "hint": "Réserves immédiates en cas de défaut."
            },
            {
                "id": "qc-elec-pieuvre-04",
                "label": "Stockage protégé de l’humidité et des chocs",
                "hint": "Conserver le repérage jusqu’à la pose."
            }
        ]
    },
    {
        "id": "electrical_first",
        "title": "19 — ÉLECTRICITÉ 1ÈRE INTERVENTION",
        "stageId": "electrical_first",
        "items": [
            {
                "id": "qc-elec1-01",
                "label": "Implantation des appareillages conforme aux plans",
                "hint": "Prises, interrupteurs, luminaires, tableau et équipements.",
                "critical": true
            },
            {
                "id": "qc-elec1-02",
                "label": "Hauteurs et alignements cohérents dans chaque pièce",
                "hint": "Tenir compte des meubles, crédences et équipements."
            },
            {
                "id": "qc-elec1-03",
                "label": "Gaines fixées sans écrasement ni courbure excessive",
                "hint": "Passages protégés et accessibles avant fermeture."
            },
            {
                "id": "qc-elec1-04",
                "label": "Séparation des réseaux et repérage des circuits",
                "hint": "Courants forts, faibles, communication et automatismes."
            },
            {
                "id": "qc-elec1-05",
                "label": "Liaison équipotentielle et terre prévues",
                "hint": "Continuité vers tableau et locaux concernés.",
                "critical": true
            },
            {
                "id": "qc-elec1-06",
                "label": "Photos des réseaux avant fermeture archivées",
                "hint": "Vue générale et repérage des passages cachés."
            }
        ]
    },
    {
        "id": "plumbing_first",
        "title": "20 — PLOMBERIE 1ÈRE INTERVENTION",
        "stageId": "plumbing_first",
        "items": [
            {
                "id": "qc-plumb1-01",
                "label": "Implantation des alimentations et évacuations conforme",
                "hint": "Cuisine, sanitaires, buanderie et équipements techniques.",
                "critical": true
            },
            {
                "id": "qc-plumb1-02",
                "label": "Diamètres, pentes et ventilation des évacuations vérifiés",
                "hint": "Éviter contre-pentes, siphonnage et raccords inaccessibles.",
                "critical": true
            },
            {
                "id": "qc-plumb1-03",
                "label": "Canalisations fixées, protégées et calorifugées si nécessaire",
                "hint": "Traversées, dilatation et protection mécanique."
            },
            {
                "id": "qc-plumb1-04",
                "label": "Attentes correctement bouchonnées et repérées",
                "hint": "Prévenir pollution, erreur et détérioration."
            },
            {
                "id": "qc-plumb1-05",
                "label": "Essai d’étanchéité ou mise en pression réalisé",
                "hint": "Tracer la date et les éventuelles corrections.",
                "critical": true
            },
            {
                "id": "qc-plumb1-06",
                "label": "Photos avant fermeture archivées",
                "hint": "Réseaux dans doublages, cloisons et planchers."
            }
        ]
    },
    {
        "id": "drywall_second",
        "title": "21 — PLÂTRERIE 2ÈME INTERVENTION",
        "stageId": "drywall_second",
        "items": [
            {
                "id": "qc-placo2-01",
                "label": "Réseaux contrôlés avant fermeture des parois",
                "hint": "Aucun oubli d’alimentation, évacuation, gaine ou renfort.",
                "critical": true
            },
            {
                "id": "qc-placo2-02",
                "label": "Isolation et membranes continues avant fermeture",
                "hint": "Jonctions, pénétrations et points singuliers.",
                "critical": true
            },
            {
                "id": "qc-placo2-03",
                "label": "Plaques correctement vissées et joints décalés",
                "hint": "Pas de bord cassé, vis saillante ou fixation manquante."
            },
            {
                "id": "qc-placo2-04",
                "label": "Découpes autour des boîtes et réseaux propres",
                "hint": "Jeux réduits et rebouchages adaptés."
            },
            {
                "id": "qc-placo2-05",
                "label": "Planéité, aplomb et équerrage des surfaces",
                "hint": "Contrôle des angles, tableaux et raccords plafonds."
            }
        ]
    },
    {
        "id": "joints",
        "title": "22 — BANDES ET ENDUITS",
        "stageId": "joints",
        "items": [
            {
                "id": "qc-joints-01",
                "label": "Bandes continues, marouflées et sans bulle",
                "hint": "Joints courants, angles entrants et sortants."
            },
            {
                "id": "qc-joints-02",
                "label": "Nombre de passes et temps de séchage respectés",
                "hint": "Support sec avant ponçage et finition."
            },
            {
                "id": "qc-joints-03",
                "label": "Têtes de vis et reprises correctement enduites",
                "hint": "Aucune surépaisseur ou manque visible."
            },
            {
                "id": "qc-joints-04",
                "label": "Angles, tableaux et raccords réguliers",
                "hint": "Profilés, arêtes et jonctions propres."
            },
            {
                "id": "qc-joints-05",
                "label": "Surface prête à recevoir la finition",
                "hint": "Ponçage, dépoussiérage et absence de défaut rasant."
            }
        ]
    },
    {
        "id": "electrical_second",
        "title": "23 — ÉLECTRICITÉ 2ÈME INTERVENTION / VMC",
        "stageId": "electrical_second",
        "items": [
            {
                "id": "qc-elec2-01",
                "label": "Tableau équipé, repéré et propre",
                "hint": "Circuits, protections, réserve et documents de repérage.",
                "critical": true
            },
            {
                "id": "qc-elec2-02",
                "label": "Appareillages alignés, fixés et conformes aux choix",
                "hint": "Plaques, commandes, prises et équipements spécifiques."
            },
            {
                "id": "qc-elec2-03",
                "label": "Tests de fonctionnement réalisés sur chaque circuit",
                "hint": "Éclairage, prises, commandes, volets et équipements.",
                "critical": true
            },
            {
                "id": "qc-elec2-04",
                "label": "Bouches VMC posées aux bons emplacements",
                "hint": "Type de bouche, accessibilité et absence d’obstruction."
            },
            {
                "id": "qc-elec2-05",
                "label": "Réseau VMC continu, fixé et non écrasé",
                "hint": "Rejets extérieurs, condensats et accessibilité du caisson.",
                "critical": true
            },
            {
                "id": "qc-elec2-06",
                "label": "Documents et attestation électrique disponibles",
                "hint": "Conserver schémas, notices et justificatifs."
            }
        ]
    },
    {
        "id": "plumbing_second",
        "title": "24 — PLOMBERIE 2ÈME INTERVENTION",
        "stageId": "plumbing_second",
        "items": [
            {
                "id": "qc-plumb2-01",
                "label": "Robinets d’arrêt et nourrices accessibles et repérés",
                "hint": "Accès maintenance sans dépose destructive."
            },
            {
                "id": "qc-plumb2-02",
                "label": "Raccordements propres, stables et sans contrainte",
                "hint": "Alimentations, évacuations et équipements."
            },
            {
                "id": "qc-plumb2-03",
                "label": "Essais d’étanchéité et d’écoulement réalisés",
                "hint": "Contrôle de chaque point d’eau et évacuation.",
                "critical": true
            },
            {
                "id": "qc-plumb2-04",
                "label": "Débits, pression et températures cohérents",
                "hint": "Vérifier absence de bruit ou coup de bélier."
            },
            {
                "id": "qc-plumb2-05",
                "label": "Joints et traversées terminés proprement",
                "hint": "Rosaces, silicone et protection des parois."
            }
        ]
    },
    {
        "id": "underfloor_heating",
        "title": "25 — PLANCHER CHAUFFANT",
        "stageId": "underfloor_heating",
        "items": [
            {
                "id": "qc-ufh-01",
                "label": "Support propre, sec et plan avant pose",
                "hint": "Aucun gravat ni point dur sous isolant."
            },
            {
                "id": "qc-ufh-02",
                "label": "Isolant de sol continu et bandes périphériques posées",
                "hint": "Traitement des jonctions, seuils et passages.",
                "critical": true
            },
            {
                "id": "qc-ufh-03",
                "label": "Circuits conformes au plan et correctement fixés",
                "hint": "Pas, longueurs, zones interdites et rayons de courbure.",
                "critical": true
            },
            {
                "id": "qc-ufh-04",
                "label": "Collecteurs accessibles, repérés et équipés",
                "hint": "Correspondance des boucles et réglages."
            },
            {
                "id": "qc-ufh-05",
                "label": "Mise en pression maintenue pendant le coulage",
                "hint": "Contrôle de pression avant et après chape.",
                "critical": true
            },
            {
                "id": "qc-ufh-06",
                "label": "Photos et plan de recollement archivés",
                "hint": "Repérer précisément les circuits avant recouvrement."
            }
        ]
    },
    {
        "id": "insulation_delivery",
        "title": "26 — LIVRAISON ISOLANT",
        "stageId": "insulation_delivery",
        "items": [
            {
                "id": "qc-insul-delivery-01",
                "label": "Références, épaisseurs et résistances thermiques conformes",
                "hint": "Comparer au dossier thermique et à la notice.",
                "critical": true
            },
            {
                "id": "qc-insul-delivery-02",
                "label": "Quantités et accessoires suffisants",
                "hint": "Membranes, adhésifs, manchettes et suspentes."
            },
            {
                "id": "qc-insul-delivery-03",
                "label": "Produits secs, emballages intacts et identifiés",
                "hint": "Refuser les matériaux mouillés ou dégradés."
            },
            {
                "id": "qc-insul-delivery-04",
                "label": "Stockage sec, ventilé et protégé",
                "hint": "Éviter tassement, écrasement et pollution."
            }
        ]
    },
    {
        "id": "insulation_installation",
        "title": "27 — POSE ISOLANT",
        "stageId": "insulation_installation",
        "items": [
            {
                "id": "qc-insul-install-01",
                "label": "Épaisseur et continuité de l’isolant contrôlées",
                "hint": "Absence de vide, tassement ou compression excessive.",
                "critical": true
            },
            {
                "id": "qc-insul-install-02",
                "label": "Découpes ajustées autour des réseaux et ossatures",
                "hint": "Éviter les ponts thermiques et passages d’air."
            },
            {
                "id": "qc-insul-install-03",
                "label": "Membrane d’étanchéité à l’air continue",
                "hint": "Recouvrements, adhésifs, raccords périphériques et pénétrations.",
                "critical": true
            },
            {
                "id": "qc-insul-install-04",
                "label": "Manchettes et traversées techniques étanchées",
                "hint": "Gaines, conduits, câbles et éléments de structure."
            },
            {
                "id": "qc-insul-install-05",
                "label": "Contrôle photographique avant fermeture",
                "hint": "Conserver les preuves des zones cachées."
            }
        ]
    },
    {
        "id": "liquid_screed",
        "title": "28 — CHAPE LIQUIDE",
        "stageId": "liquid_screed",
        "items": [
            {
                "id": "qc-screed-01",
                "label": "Support préparé, propre et étanche aux fuites de laitance",
                "hint": "Reprises, passages et périphéries traités."
            },
            {
                "id": "qc-screed-02",
                "label": "Bandes périphériques et joints prévus correctement",
                "hint": "Désolidarisation, fractionnement et seuils.",
                "critical": true
            },
            {
                "id": "qc-screed-03",
                "label": "Repères de niveau et épaisseurs vérifiés",
                "hint": "Compatibilité avec portes, carrelage et niveaux finis.",
                "critical": true
            },
            {
                "id": "qc-screed-04",
                "label": "Réseaux protégés et plancher chauffant sous pression",
                "hint": "Aucun déplacement ni fuite pendant le coulage."
            },
            {
                "id": "qc-screed-05",
                "label": "Coulage homogène et surface sans défaut majeur",
                "hint": "Planéité, fissure, ségrégation et absence de zone creuse."
            },
            {
                "id": "qc-screed-06",
                "label": "Séchage, ventilation et mise en chauffe documentés",
                "hint": "Respecter les consignes avant revêtements.",
                "critical": true
            }
        ]
    },
    {
        "id": "attic_insulation",
        "title": "29 — ISOLATION DES COMBLES",
        "stageId": "attic_insulation",
        "items": [
            {
                "id": "qc-attic-01",
                "label": "Support et plafond prêts avant soufflage ou déroulage",
                "hint": "Étanchéité à l’air et réseaux terminés."
            },
            {
                "id": "qc-attic-02",
                "label": "Épaisseur et résistance thermique conformes",
                "hint": "Repères de hauteur visibles et fiche chantier disponible.",
                "critical": true
            },
            {
                "id": "qc-attic-03",
                "label": "Isolation homogène jusque dans les zones difficiles",
                "hint": "Rives, trappes, pieds de fermettes et angles."
            },
            {
                "id": "qc-attic-04",
                "label": "Distances de sécurité autour des sources chaudes",
                "hint": "Conduits, spots et équipements selon systèmes prévus.",
                "critical": true
            },
            {
                "id": "qc-attic-05",
                "label": "Ventilation de couverture non obstruée",
                "hint": "Déflecteurs ou arrêts d’isolant aux égouts."
            },
            {
                "id": "qc-attic-06",
                "label": "Trappe isolée, jointive et accessible",
                "hint": "Protection contre chute d’isolant et passage d’air."
            }
        ]
    },
    {
        "id": "sanitary_delivery",
        "title": "30 — LIVRAISON SANITAIRES",
        "stageId": "sanitary_delivery",
        "items": [
            {
                "id": "qc-san-delivery-01",
                "label": "Références, coloris et quantités conformes",
                "hint": "Comparer aux choix client et à la commande."
            },
            {
                "id": "qc-san-delivery-02",
                "label": "Dimensions compatibles avec les réservations",
                "hint": "Receveurs, meubles, WC, baignoires et robinetterie."
            },
            {
                "id": "qc-san-delivery-03",
                "label": "Aucune casse, rayure ou pièce manquante",
                "hint": "Vérifier immédiatement les colis sensibles."
            },
            {
                "id": "qc-san-delivery-04",
                "label": "Stockage protégé, identifié et sécurisé",
                "hint": "Éviter la manutention inutile et les chocs."
            }
        ]
    },
    {
        "id": "sanitary",
        "title": "31 — SANITAIRES",
        "stageId": "sanitary",
        "items": [
            {
                "id": "qc-sanitary-01",
                "label": "Implantation et hauteur des appareils conformes",
                "hint": "Plans, usage, accessibilité et alignements."
            },
            {
                "id": "qc-sanitary-02",
                "label": "Fixations stables et supports adaptés",
                "hint": "Meubles, vasques, WC, receveurs et baignoires."
            },
            {
                "id": "qc-sanitary-03",
                "label": "Étanchéité périphérique et sous équipements terminée",
                "hint": "Silicones, raccords, parois et zones exposées.",
                "critical": true
            },
            {
                "id": "qc-sanitary-04",
                "label": "Chaque appareil testé en eau et en évacuation",
                "hint": "Fuites, débit, vidage, siphon et débordement.",
                "critical": true
            },
            {
                "id": "qc-sanitary-05",
                "label": "Robinetterie réglée et eau chaude correctement distribuée",
                "hint": "Sens chaud/froid, température et stabilité."
            },
            {
                "id": "qc-sanitary-06",
                "label": "Appareils propres, protégés et sans dégradation",
                "hint": "Retirer les protections seulement au bon moment."
            }
        ]
    },
    {
        "id": "tile_delivery",
        "title": "32 — LIVRAISON CARRELAGE",
        "stageId": "tile_delivery",
        "items": [
            {
                "id": "qc-tile-delivery-01",
                "label": "Références, formats, teintes et calibres conformes",
                "hint": "Comparer aux choix et vérifier les bains/nuances."
            },
            {
                "id": "qc-tile-delivery-02",
                "label": "Quantités suffisantes avec marge prévue",
                "hint": "Inclure plinthes, profils, découpes et réserve client."
            },
            {
                "id": "qc-tile-delivery-03",
                "label": "Colles, joints et systèmes d’étanchéité compatibles",
                "hint": "Support, local, format et usage."
            },
            {
                "id": "qc-tile-delivery-04",
                "label": "Palettes protégées et carreaux sans casse",
                "hint": "Stockage sec et stable."
            }
        ]
    },
    {
        "id": "tile_installation",
        "title": "33 — POSE CARRELAGE / FAÏENCE",
        "stageId": "tile_installation",
        "items": [
            {
                "id": "qc-tile-01",
                "label": "Support sec, propre, plan et compatible",
                "hint": "Contrôle avant primaire, colle ou étanchéité.",
                "critical": true
            },
            {
                "id": "qc-tile-02",
                "label": "Étanchéité des zones humides réalisée avant pose",
                "hint": "Angles, relevés, traversées et raccords.",
                "critical": true
            },
            {
                "id": "qc-tile-03",
                "label": "Calepinage validé et coupes équilibrées",
                "hint": "Axes, seuils, alignement faïence et équipements."
            },
            {
                "id": "qc-tile-04",
                "label": "Planéité, alignement et largeur de joints réguliers",
                "hint": "Absence de ressaut gênant ou carreau creux."
            },
            {
                "id": "qc-tile-05",
                "label": "Joints périphériques et fractionnements respectés",
                "hint": "Désolidarisation et continuité aux seuils.",
                "critical": true
            },
            {
                "id": "qc-tile-06",
                "label": "Silicones, profils et finitions propres",
                "hint": "Angles, baignoire, douche, plinthes et seuils."
            }
        ]
    },
    {
        "id": "interior_joinery_installation",
        "title": "34 — POSE MENUISERIES INTÉRIEURES",
        "stageId": "interior_joinery_installation",
        "items": [
            {
                "id": "qc-mint-01",
                "label": "Huisseries d’aplomb, de niveau et bien fixées",
                "hint": "Jeux réguliers et absence de déformation."
            },
            {
                "id": "qc-mint-02",
                "label": "Sens d’ouverture et modèles conformes aux plans",
                "hint": "Vérifier chaque porte et équipement."
            },
            {
                "id": "qc-mint-03",
                "label": "Jeu sous portes compatible avec ventilation et sols finis",
                "hint": "Éviter frottements et défaut de transfert d’air."
            },
            {
                "id": "qc-mint-04",
                "label": "Serrures, poignées et butées fonctionnent correctement",
                "hint": "Réglage, fixation et cohérence des finitions."
            },
            {
                "id": "qc-mint-05",
                "label": "Habillages, couvre-joints et plinthes terminés proprement",
                "hint": "Coupes, raccords et pointes rebouchées."
            },
            {
                "id": "qc-mint-06",
                "label": "Éléments sans choc, rayure ou éclat",
                "hint": "Protection maintenue jusqu’à la réception."
            }
        ]
    },
    {
        "id": "painting",
        "title": "35 — PEINTURE",
        "stageId": "painting",
        "items": [
            {
                "id": "qc-paint-01",
                "label": "Supports secs, dépoussiérés et correctement préparés",
                "hint": "Reprises, ponçage, impression et protection des ouvrages."
            },
            {
                "id": "qc-paint-02",
                "label": "Teintes et niveaux de finition conformes aux choix",
                "hint": "Murs, plafonds, boiseries et pièces spécifiques."
            },
            {
                "id": "qc-paint-03",
                "label": "Couverture homogène sans trace ni reprise visible",
                "hint": "Contrôle en lumière naturelle et lumière rasante."
            },
            {
                "id": "qc-paint-04",
                "label": "Angles, découpes et raccords nets",
                "hint": "Menuiseries, appareillages, plafonds et plinthes."
            },
            {
                "id": "qc-paint-05",
                "label": "Protections retirées sans dégradation",
                "hint": "Nettoyer coulures, poussières et résidus."
            }
        ]
    },
    {
        "id": "stairs",
        "title": "36 — ESCALIER",
        "stageId": "stairs",
        "items": [
            {
                "id": "qc-stairs-01",
                "label": "Dimensions de trémie et niveaux finis compatibles",
                "hint": "Contrôler avant fabrication et avant pose.",
                "critical": true
            },
            {
                "id": "qc-stairs-02",
                "label": "Escalier stable, correctement fixé et sans jeu",
                "hint": "Ancrages, appuis et liaison aux planchers.",
                "critical": true
            },
            {
                "id": "qc-stairs-03",
                "label": "Marches régulières et circulation confortable",
                "hint": "Départ, arrivée, échappée et alignement."
            },
            {
                "id": "qc-stairs-04",
                "label": "Garde-corps et mains courantes complets et rigides",
                "hint": "Protection contre chute et fixations.",
                "critical": true
            },
            {
                "id": "qc-stairs-05",
                "label": "Finition conforme et absence de choc ou rayure",
                "hint": "Protection pendant les autres travaux."
            }
        ]
    },
    {
        "id": "render",
        "title": "37 — ENDUIT EXTÉRIEUR",
        "stageId": "render",
        "items": [
            {
                "id": "qc-render-01",
                "label": "Support propre, sec et préparé avant application",
                "hint": "Reprises, protections et conditions météo adaptées."
            },
            {
                "id": "qc-render-02",
                "label": "Teinte, texture et modénatures conformes au projet",
                "hint": "Échantillon ou choix validé avant généralisation."
            },
            {
                "id": "qc-render-03",
                "label": "Armatures et renforts présents aux points sensibles",
                "hint": "Baies, changements de support et fissures potentielles."
            },
            {
                "id": "qc-render-04",
                "label": "Épaisseur, régularité et finition homogènes",
                "hint": "Absence de manque, cloquage, fissure ou spectre excessif."
            },
            {
                "id": "qc-render-05",
                "label": "Tableaux, arêtes, soubassements et raccords soignés",
                "hint": "Détails autour des menuiseries et équipements."
            },
            {
                "id": "qc-render-06",
                "label": "Menuiseries, seuils et abords nettoyés",
                "hint": "Aucune projection ou dégradation."
            }
        ]
    },
    {
        "id": "heating",
        "title": "38 — CHAUFFAGE / PAC",
        "stageId": "heating",
        "items": [
            {
                "id": "qc-heating-01",
                "label": "Équipements conformes à l’étude et aux choix",
                "hint": "Modèle, puissance, accessoires et emplacement.",
                "critical": true
            },
            {
                "id": "qc-heating-02",
                "label": "Unité extérieure stable, accessible et correctement implantée",
                "hint": "Nuisances, évacuation condensats et maintenance."
            },
            {
                "id": "qc-heating-03",
                "label": "Liaisons, calorifuge et traversées correctement traités",
                "hint": "Protection mécanique, étanchéité et finition."
            },
            {
                "id": "qc-heating-04",
                "label": "Régulation, sondes et zones fonctionnent",
                "hint": "Paramétrage, programmation et consignes client."
            },
            {
                "id": "qc-heating-05",
                "label": "Mise en service et essais documentés",
                "hint": "Valeurs, réglages, réserves et rapport de mise en service.",
                "critical": true
            },
            {
                "id": "qc-heating-06",
                "label": "Notices et consignes d’entretien disponibles",
                "hint": "Préparer la remise au client."
            }
        ]
    },
    {
        "id": "final_earthworks",
        "title": "39 — FINITION TERRASSEMENT / VRD",
        "stageId": "final_earthworks",
        "items": [
            {
                "id": "qc-final-earth-01",
                "label": "Branchements aux réseaux réalisés et identifiés",
                "hint": "Eau, électricité, télécom, assainissement et EP.",
                "critical": true
            },
            {
                "id": "qc-final-earth-02",
                "label": "Pentes de terrain éloignent les eaux de la maison",
                "hint": "Pas de cuvette ni ruissellement vers les façades.",
                "critical": true
            },
            {
                "id": "qc-final-earth-03",
                "label": "Regards accessibles, stables et à bonne altitude",
                "hint": "Couvercles, repérage et protection."
            },
            {
                "id": "qc-final-earth-04",
                "label": "Remblais compactés sans dommage aux ouvrages",
                "hint": "Réseaux, drains, terrasses et soubassements."
            },
            {
                "id": "qc-final-earth-05",
                "label": "Terre végétale répartie et abords nivelés",
                "hint": "Préparer l’usage futur et la gestion des eaux."
            },
            {
                "id": "qc-final-earth-06",
                "label": "Chantier débarrassé des déchets et gravats enterrés",
                "hint": "Aucun résidu caché dans les remblais."
            }
        ]
    },
    {
        "id": "permeability_test",
        "title": "40 — TEST DE PERMÉABILITÉ",
        "stageId": "permeability_test",
        "items": [
            {
                "id": "qc-permea-01",
                "label": "Bâtiment prêt et configuration du test définie",
                "hint": "Ouvertures, siphons, ventilation et équipements selon protocole."
            },
            {
                "id": "qc-permea-02",
                "label": "Percements et traversées inspectés avant le test",
                "hint": "Menuiseries, trappes, gaines, conduits et réseaux.",
                "critical": true
            },
            {
                "id": "qc-permea-03",
                "label": "Fuites détectées localisées et photographiées",
                "hint": "Créer une liste d’actions avec responsable."
            },
            {
                "id": "qc-permea-04",
                "label": "Corrections réalisées sans dégrader les ouvrages",
                "hint": "Solutions durables et compatibles avec les finitions."
            },
            {
                "id": "qc-permea-05",
                "label": "Rapport final reçu, conforme et archivé",
                "hint": "Joindre le justificatif au dossier de réception.",
                "critical": true
            }
        ]
    },
    {
        "id": "cleaning",
        "title": "41 — NETTOYAGE / PRÉ-RÉCEPTION",
        "stageId": "cleaning",
        "items": [
            {
                "id": "qc-cleaning-01",
                "label": "Tous les locaux et équipements nettoyés",
                "hint": "Sols, vitrages, sanitaires, meubles, appareils et extérieurs."
            },
            {
                "id": "qc-cleaning-02",
                "label": "Protections, étiquettes et résidus de chantier retirés",
                "hint": "Sans rayer ni dégrader les ouvrages."
            },
            {
                "id": "qc-cleaning-03",
                "label": "Essais fonctionnels complets réalisés",
                "hint": "Eau, électricité, chauffage, VMC, volets, portes et équipements.",
                "critical": true
            },
            {
                "id": "qc-cleaning-04",
                "label": "Liste interne de réserves établie et affectée",
                "hint": "Photo, localisation, responsable et délai de levée."
            },
            {
                "id": "qc-cleaning-05",
                "label": "Retouches et reprises terminées avant visite client",
                "hint": "Contrôle croisé après intervention."
            },
            {
                "id": "qc-cleaning-06",
                "label": "Clés, télécommandes, notices et documents regroupés",
                "hint": "Préparer une remise complète et ordonnée."
            }
        ]
    },
    {
        "id": "reception",
        "title": "42 — RÉCEPTION / REMISE DES CLÉS",
        "stageId": "reception",
        "items": [
            {
                "id": "qc-reception-01",
                "label": "Dossier de réception et documents obligatoires préparés",
                "hint": "Attestations, rapports, notices, garanties et plans utiles.",
                "critical": true
            },
            {
                "id": "qc-reception-02",
                "label": "Relevés de compteurs et mise en service enregistrés",
                "hint": "Eau, électricité, chauffage et équipements."
            },
            {
                "id": "qc-reception-03",
                "label": "Fonctionnement des équipements expliqué au client",
                "hint": "Chauffage, VMC, volets, entretien et coupures."
            },
            {
                "id": "qc-reception-04",
                "label": "Réserves précisément décrites et localisées",
                "hint": "Photo, entreprise responsable et délai de levée.",
                "critical": true
            },
            {
                "id": "qc-reception-05",
                "label": "Procès-verbal signé et exemplaires remis",
                "hint": "Date, réserves, clés et observations."
            },
            {
                "id": "qc-reception-06",
                "label": "Planning de levée des réserves communiqué",
                "hint": "Suivi jusqu’à clôture complète du dossier."
            }
        ]
    }
];

},
"src/data/lots": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_LOTS = void 0;
exports.cloneDefaultLots = cloneDefaultLots;
exports.getLotOrder = getLotOrder;
exports.normalizeLotOrders = normalizeLotOrders;
const now = '2026-07-21T00:00:00.000Z';
exports.DEFAULT_LOTS = [
    { id: 'lot-earthworks', order: 1, name: 'Terrassement', code: 'TERR', stageIds: ['opening', 'pre_backfill', 'final_earthworks'], createdAt: now, updatedAt: now },
    { id: 'lot-structural', order: 2, name: 'Gros Œuvre', code: 'GO', stageIds: ['foundations', 'vs_basement', 'tubing', 'floor_slab_pour', 'elevations', 'thresholds'], createdAt: now, updatedAt: now },
    { id: 'lot-frame', order: 3, name: 'Charpente', code: 'CHARP', stageIds: ['frame_delivery', 'frame'], createdAt: now, updatedAt: now },
    { id: 'lot-roof', order: 4, name: 'Couverture', code: 'COUV', stageIds: ['roof'], createdAt: now, updatedAt: now },
    { id: 'lot-zinc', order: 5, name: 'Zinguerie', code: 'ZING', stageIds: ['zinc'], createdAt: now, updatedAt: now },
    { id: 'lot-exterior-joinery', order: 6, name: 'Menuiseries Extérieures', code: 'MEXT', stageIds: ['ext_joinery_delivery', 'ext_joinery'], createdAt: now, updatedAt: now },
    { id: 'lot-interior-joinery', order: 7, name: 'Menuiseries Intérieures', code: 'MINT', stageIds: ['interior_joinery_delivery', 'interior_joinery_installation'], createdAt: now, updatedAt: now },
    { id: 'lot-render', order: 8, name: 'Enduit', code: 'END', stageIds: ['render'], createdAt: now, updatedAt: now },
    { id: 'lot-plastering', order: 9, name: 'Plâtrerie', code: 'PLAT', stageIds: ['drywall_delivery', 'drywall_first', 'drywall_second', 'joints'], createdAt: now, updatedAt: now },
    { id: 'lot-electricity', order: 10, name: 'Électricité', code: 'ELEC', stageIds: ['electrical_octopus_delivery', 'electrical_first', 'electrical_second'], createdAt: now, updatedAt: now },
    { id: 'lot-plumbing', order: 11, name: 'Plomberie', code: 'PLOMB', stageIds: ['plumbing_first', 'plumbing_second'], createdAt: now, updatedAt: now },
    { id: 'lot-heating', order: 12, name: 'Chauffage', code: 'CHAUF', stageIds: ['underfloor_heating', 'heating'], createdAt: now, updatedAt: now },
    { id: 'lot-insulation', order: 13, name: 'Isolation', code: 'ISOL', stageIds: ['insulation_delivery', 'insulation_installation'], createdAt: now, updatedAt: now },
    { id: 'lot-liquid-screed', order: 14, name: 'Chappe liquide', code: 'CHAPE', stageIds: ['liquid_screed'], createdAt: now, updatedAt: now },
    { id: 'lot-attic-insulation', order: 15, name: 'Isolation combles', code: 'ISOC', stageIds: ['attic_insulation'], createdAt: now, updatedAt: now },
    { id: 'lot-tiling', order: 16, name: 'Carrelage', code: 'CARR', stageIds: ['tile_delivery', 'tile_installation'], createdAt: now, updatedAt: now },
    { id: 'lot-stairs', order: 17, name: 'Escalier', code: 'ESC', stageIds: ['stairs'], createdAt: now, updatedAt: now },
    { id: 'lot-sanitary', order: 18, name: 'Sanitaires', code: 'SANI', stageIds: ['sanitary_delivery', 'sanitary'], createdAt: now, updatedAt: now },
    { id: 'lot-painting', order: 19, name: 'Peintures', code: 'PEINT', stageIds: ['painting'], createdAt: now, updatedAt: now },
    { id: 'lot-soft-flooring', order: 20, name: 'Sols souples', code: 'SOLS', stageIds: [], createdAt: now, updatedAt: now },
    { id: 'lot-permeability', order: 21, name: 'Teste perméa', code: 'PERMEA', stageIds: ['permeability_test'], createdAt: now, updatedAt: now },
    { id: 'lot-cleaning', order: 22, name: 'Nettoyage', code: 'NETT', stageIds: ['cleaning'], createdAt: now, updatedAt: now },
];
function cloneDefaultLots() {
    return exports.DEFAULT_LOTS.map((lot) => ({ ...lot, stageIds: [...(lot.stageIds ?? [])] }));
}
function getLotOrder(lot) {
    return typeof lot.order === 'number' ? lot.order : 999;
}
function normalizeLotOrders(lots) {
    return [...lots]
        .sort((a, b) => {
        const orderDifference = getLotOrder(a) - getLotOrder(b);
        return orderDifference !== 0 ? orderDifference : a.name.localeCompare(b.name, 'fr');
    })
        .map((lot, index) => ({
        ...lot,
        order: index + 1,
        fixed: false,
        stageIds: [...(lot.stageIds ?? [])],
    }));
}

},
"src/data/mockData": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOCUMENTS = exports.PROJECTS = exports.ARTISANS = exports.LOTS = void 0;
const lots_1 = require("./lots");
// Version vierge : seuls les lots de base sont conservés.
// Les clients, chantiers, entreprises et documents sont créés par l'utilisateur.
exports.LOTS = lots_1.DEFAULT_LOTS.map((lot) => ({
    ...lot,
    stageIds: [...(lot.stageIds ?? [])],
}));
exports.ARTISANS = [];
exports.PROJECTS = [];
exports.DOCUMENTS = [];

},
"src/data/stages": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEETING_REMINDER_STAGE_IDS = exports.STAGE_IDS = exports.STAGES = void 0;
// Trame métier demandée par l'utilisateur. L'ordre ci-dessous est celui du planning.
exports.STAGES = [
    { id: 'map', label: 'MAP', shortLabel: 'MAP', color: '#94a3b8', group: 'Préparation', dateOnly: true },
    { id: 'av_exchange', label: 'AV envoi & retour', shortLabel: 'AV envoi/retour', color: '#94a3b8', group: 'Préparation', dateOnly: true },
    { id: 'mse_exchange', label: 'MSE envoi & retour', shortLabel: 'MSE envoi/retour', color: '#94a3b8', group: 'Préparation', dateOnly: true },
    { id: 'order_sending', label: 'Envoi commande', shortLabel: 'Envoi commande', color: '#94a3b8', group: 'Préparation', dateOnly: true },
    { id: 'opening', label: 'Ouverture', shortLabel: 'Ouverture', color: '#e30613', textColor: '#fff', group: 'Gros œuvre' },
    { id: 'foundations', label: 'Fondations', shortLabel: 'Fondations', color: '#64748b', textColor: '#fff', group: 'Gros œuvre' },
    { id: 'vs_basement', label: 'VS / SSol', shortLabel: 'VS / SSol', color: '#94a3b8', group: 'Gros œuvre' },
    { id: 'tubing', label: 'Tubage', shortLabel: 'Tubage', color: '#a8b3c2', group: 'Gros œuvre' },
    { id: 'floor_slab_pour', label: 'Coulage du plancher', shortLabel: 'Coulage plancher', color: '#b8c4d1', group: 'Gros œuvre' },
    { id: 'elevations', label: 'Élévations', shortLabel: 'Élévations', color: '#f97316', group: 'Gros œuvre' },
    { id: 'frame_delivery', label: 'Livraison Charpente', shortLabel: 'Liv. Charpente', color: '#fde68a', group: "Hors d'eau / hors d'air" },
    { id: 'frame', label: 'Charpente', shortLabel: 'Charpente', color: '#facc15', group: "Hors d'eau / hors d'air" },
    { id: 'roof', label: 'Couverture', shortLabel: 'Couverture', color: '#eab308', group: "Hors d'eau / hors d'air" },
    { id: 'zinc', label: 'Zinguerie', shortLabel: 'Zinguerie', color: '#ca8a04', textColor: '#fff', group: "Hors d'eau / hors d'air" },
    { id: 'thresholds', label: 'Pose des seuils', shortLabel: 'Pose seuils', color: '#d1d5db', group: "Hors d'eau / hors d'air" },
    { id: 'pre_backfill', label: 'Pré remblais', shortLabel: 'Pré remblais', color: '#d6d3d1', group: "Hors d'eau / hors d'air" },
    { id: 'ext_joinery_delivery', label: 'Livraison Mext', shortLabel: 'Liv. Mext', color: '#bae6fd', group: "Hors d'eau / hors d'air" },
    { id: 'ext_joinery', label: 'Mext', shortLabel: 'Mext', color: '#38bdf8', group: "Hors d'eau / hors d'air" },
    { id: 'interior_joinery_delivery', label: 'Livraison Mint', shortLabel: 'Liv. Mint', color: '#d8b4fe', group: 'Second œuvre' },
    { id: 'drywall_delivery', label: 'Livraison Placo', shortLabel: 'Liv. Placo', color: '#fdba74', group: 'Second œuvre' },
    { id: 'drywall_first', label: 'Placo 1ère', shortLabel: 'Placo 1ère', color: '#fb923c', group: 'Second œuvre' },
    { id: 'electrical_octopus_delivery', label: 'Livraison Pieuvre élec', shortLabel: 'Liv. Pieuvre élec', color: '#86efac', group: 'Second œuvre' },
    { id: 'electrical_first', label: 'Électricité 1ère', shortLabel: 'Élec. 1ère', color: '#4ade80', group: 'Second œuvre' },
    { id: 'plumbing_first', label: 'Plomberie 1ère', shortLabel: 'Plomb. 1ère', color: '#22c55e', textColor: '#fff', group: 'Second œuvre' },
    { id: 'drywall_second', label: 'Placo 2ème', shortLabel: 'Placo 2ème', color: '#f59e0b', group: 'Second œuvre' },
    { id: 'joints', label: 'Bandes', shortLabel: 'Bandes', color: '#fbbf24', group: 'Second œuvre' },
    { id: 'electrical_second', label: 'Électricité 2ème', shortLabel: 'Élec. 2ème', color: '#16a34a', textColor: '#fff', group: 'Second œuvre' },
    { id: 'plumbing_second', label: 'Plomberie 2ème', shortLabel: 'Plomb. 2ème', color: '#15803d', textColor: '#fff', group: 'Second œuvre' },
    { id: 'underfloor_heating', label: 'Plancher chauffant', shortLabel: 'Plancher ch.', color: '#f0abfc', group: 'Second œuvre' },
    { id: 'insulation_delivery', label: 'Livraison Isolant', shortLabel: 'Liv. Isolant', color: '#ddd6fe', group: 'Second œuvre' },
    { id: 'insulation_installation', label: 'Pose Isolant', shortLabel: 'Pose Isolant', color: '#c4b5fd', group: 'Second œuvre' },
    { id: 'liquid_screed', label: 'Chappe liquide', shortLabel: 'Chappe liq.', color: '#e9d5ff', group: 'Second œuvre' },
    { id: 'attic_insulation', label: 'Isolation combles', shortLabel: 'Iso. combles', color: '#a78bfa', group: 'Second œuvre' },
    { id: 'sanitary_delivery', label: 'Livraison sanitaires', shortLabel: 'Liv. sanitaires', color: '#fef08a', group: 'Finitions' },
    { id: 'sanitary', label: 'Sanitaires', shortLabel: 'Sanitaires', color: '#fde047', group: 'Finitions' },
    { id: 'tile_delivery', label: 'Livraison carrelage', shortLabel: 'Liv. carrelage', color: '#7dd3fc', group: 'Finitions' },
    { id: 'tile_installation', label: 'Pose carrelage', shortLabel: 'Pose carrelage', color: '#0ea5e9', textColor: '#fff', group: 'Finitions' },
    { id: 'interior_joinery_installation', label: 'Pose Mint', shortLabel: 'Pose Mint', color: '#c084fc', group: 'Finitions' },
    { id: 'painting', label: 'Peinture', shortLabel: 'Peinture', color: '#fb7185', group: 'Finitions' },
    { id: 'stairs', label: 'Escalier', shortLabel: 'Escalier', color: '#fed7aa', group: 'Finitions' },
    { id: 'render', label: 'Enduit', shortLabel: 'Enduit', color: '#fcd34d', group: 'Finitions' },
    { id: 'heating', label: 'Chauffage', shortLabel: 'Chauffage', color: '#f9a8d4', group: 'Finitions' },
    { id: 'final_earthworks', label: 'Finition Terrassement', shortLabel: 'Fin. Terrassement', color: '#a8a29e', textColor: '#fff', group: 'Finitions' },
    { id: 'permeability_test', label: 'Teste perméa', shortLabel: 'Teste perméa', color: '#ef4444', textColor: '#fff', group: 'Finitions' },
    { id: 'cleaning', label: 'Nettoyage', shortLabel: 'Nettoyage', color: '#cbd5e1', group: 'Finitions' },
];
exports.STAGE_IDS = new Set(exports.STAGES.map((stage) => stage.id));
exports.MEETING_REMINDER_STAGE_IDS = [
    'floor_slab_pour',
    'elevations',
    'ext_joinery',
    'plumbing_first',
    'liquid_screed',
    'tile_installation',
];

},
"src/lib/artisanPlanningPdf": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizePlanningFileName = void 0;
exports.createArtisanPlanningPdf = createArtisanPlanningPdf;
const MM = 72 / 25.4;
const PAGE_WIDTH = 420 * MM;
const PAGE_HEIGHT = 297 * MM;
const MARGIN_X = 7 * MM;
const MARGIN_TOP = 7 * MM;
const MARGIN_BOTTOM = 6 * MM;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const HEADER_HEIGHT = 27 * MM;
const SECTION_GAP = 4 * MM;
const INFO_HEIGHT = 15 * MM;
const TABLE_HEADER_HEIGHT = 9 * MM;
const ROW_HEIGHT = 12 * MM;
const FOOTER_GAP = 5 * MM;
const FOOTER_TOP_PADDING = 3 * MM;
const OBSERVATION_HEIGHT = 14 * MM;
const FOOTER_HEIGHT = FOOTER_GAP + FOOTER_TOP_PADDING + OBSERVATION_HEIGHT + 7 * MM;
const LOGO_WIDTH = 520;
const LOGO_HEIGHT = 273;
const LOGO_JPEG_BASE64 = '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAQDAwMDAgQDAwMEBAQFBgoGBgUFBgwICQcKDgwPDg4MDQ0PERYTDxAVEQ0NExoTFRcYGRkZDxIbHRsYHRYYGRj/2wBDAQQEBAYFBgsGBgsYEA0QGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBj/wAARCAERAggDASIAAhEBAxEB/8QAHQABAAMBAAMBAQAAAAAAAAAAAAYHCAUDBAkBAv/EAFMQAAEDAwEDCAIKDgcIAwEAAAABAgMEBREGBxIhCBMxQVFhcYEUIhUWIzJCcoKRobEYN1JVYnN1kpSys8HR0zM1NlZ0ldIXJCVDg5PC8DRTVOL/xAAcAQEBAAIDAQEAAAAAAAAAAAAAAQIFBAYHAwj/xAA6EQEAAQIEAwQGCQIHAAAAAAAAAQIDBAURIQYxQRIicYEHE1GCkfAUFWFykqGxwdEWUiMkMlRik7L/2gAMAwEAAhEDEQA/AN/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADw1lXT0FvnrquVsVPBG6WWRy4RjWplVXwRFM5aQ5WVLqTaPbdP1mlGW+gr6r0ZlctbvqzeVUjVzNxE4ruovHhvdeD4XsTbszFNc6TPJt8tyHHZnbu3sJb7VNuNat4jTnPWY15TtGstJgFMbZtvkGynUNustLYmXirqYHVMzXVXMpAze3WdDXZVyo/s973mV69RZp7dydIfDLMrxWZ4iMLhKO1XOu2sRy3nedIXOCG7LtoFLtL2bUmqKemSklke+GopUk5zmJWLhW72Ezw3VRcJwchMjOiuK6Yqp5S4+Kwt3CXq8PfjSumZiY9kwAAyccAAAHq0tfBV1dXTRr7pSyJG9PFqKi/T9B7QAHiqqmKjopaqd27HExXuXuRBS1DKqhhqo0w2ViPRF7FTIHlAAAHPfd6Rmoo7O53u74llRc8Ono8cZXyOgAAOZfbt7C2la5YOeRHtarEdu9K46QOmDj2HUVLfmS+jwzRPixvtkxjjnGFRePQdgACNXbWtstlQ6miY+rmYuHJGqI1q9iuXr8D0KbaJSPlRtXb5oWL8Nj0fjy4ATQHhpaunrqRlTSTNliemWub1nmAA5d21BbLM1PTJsyKmWwxpvPXy6k8SNv2jRI/EdqkVva6VEX6lAnAI1bNb2ivlbDPv0cjuCc9jdX5SfvwSVFRUygAA59qvFLdoZVgXdkiesckSrxaqKqfMuOCgdAA5d8vUNioGVU0MkqPfzaNZjOcKvX4AdQHH0/fm3+mnmZSugSJ6Mw528q8M5OwAByb1qG32ONvpLnPmemWQx8XKnb3J3ka/2je6/wBULufjuP1ATsHKs2obde419FkVsrUy6GTg5O/vTvQ6oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAUdypdae1vYy6xU0u5W36T0RERcKkDfWlXzTdZ8swy1z2vR7Hqx6Llrm8FavUqeBbnKR1p7btuVbTU8u/QWVvsdBheCvauZXeb8t8GIVIsUjYWyujekb1VGvVFw5UxlEXrxlPnQ6dmV/11+ZjlGz9QcCZP9WZRaprjSu5358+UeVOnnq+j+yzXEOt9jVp1TPNG2ZafcrlVcJHNH6smexMorvBUMFbTNYSa72r3rU6ucsFTOraZq/BgZ6safmoi+KqdHTW125aH2K6w0hTJK72ZSJtNI1eFOrl3J1+VFhE70IJDG+oe1lPG6RXJlrWNVVVMZ4IncmT643GTfs26fj48vnxcDhThe3lGZY297ZiKPsonvfrpT7rRnJH1r7Ga7uOiauXFPdYvSaZFXgk8aesifGZ+obKPlzp6+1umdV23UVtdiqoKhlTFj4StXO74KmUXuU+mthvNFqHTFvvttkSSkrqdlTE7OfVc1FTPfxx5Gzya/27c2p5x+joPpTyf6PjqMfRHduxpP3qf5jT4S6IANy8sAD1rhUJS2mqqVXHNxOf8yAVzaL6tLr+eqe7EFXO6OTsRFd6q+S4+ks8oprHujV+6qtbjeVOrJaumb2yv0slRUyIklM1WTuX8FM73mnH5wOXr+7czRxWmJ3rTe6S4+5ReCea/UdjSFR6To6jVVy5jViX5Kqn1YKzuldNd7vU3BzXYcu9j7hicET6vNSb7PKjfs9XSqvGObeRO5yfxRQJieKpqIqSjlqZ3bscbVe5exEPKQrX915ukitETvWl90lx9yi8E81+oCG1F2qp9Quu6PVs6y8638HHQnhjCFuWyviudpgrofeytzj7letPJckBptN87s4lrubzVOd6Szhx3G8MeaZX5j2NAXbmquW0Su9SXMkOfuk6U804+SgWCRrXX9kJPxsf6xJSNa6/sfJ+Nj/WA5Gzj39x8I//ACJTqGqlotL1tTCqtkbEu6qdSrwz9JFtnHv7j4R/+RM7jRR3G1VFDKqo2ZisynV3gVVpqzxXq+JSzyuZE1iyO3V9Z2FRMJ85K7noCkkp960zPhmT4Ezlcx3n0oQ6qo7tp65osiS00rF9SZnvXd6L1+B3bdr+4Quay4wR1MfW9ibj/wCC/QBN7NaYLLaWUUCq7HrPevS9y9Knh1FeG2WxyVSIjpnLuRNXrcvb3JxXyPeoa2muNBHWUkm/FImUXo8l7yEbRZnrU0FPx3Ea9/iuUQCN2+33HUd5c1jlkleu/LNIvBqdq/uQmkGz21NgRKirq5JOtzVRqfNhTy6Bp449MOqGtTnJpXby/F4In1/OSoCrtQ6QqLPCtXTSLUUie+VUw6Px7U7zraFv0r5VstXIrk3VdA5y8Ux0t/enmTiaKOenfDK3eY9qtcnai8FKetTnUerKTm3KvN1TWZTrTe3fqAuQpuK5VVq1JNWUb917ZnoqL0PTeXKL3FydRS/o/peplpN/c56qWPexnGXqmQLWsl6pb3bkqadd16cJIlXixf4dinD2h/2dpv8AEp+q4h7XXbSeoV4c3KzpT4EzP3ov0Eg1Vd6W9aLpaqmdhUqUSSNeljtx3BQPb2df1TW/j0/VQmZDNnX9U1v49P1UJmBTt9nkr9WVbpH4VZ1ibvdDURd1Cc+0OyLRczmoSXH9Nv8AHPbjo8iP6t0zWU90nuVJA6ammdzjkYmVjcvTlOzryc+26uvVtY2JtQlRE3gkc6b2O7PSgE101pRlkllqaiRk9S5Vax7UwjWfxXrJIcTT+paW/Qua1nM1MaZfCq54dqL1odsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ/ajrGPQeya9alVzUnp4FZStX4c7/VjT85UXwRSYGRuV9rX0i82jQNJNmOmb7I1qNX/mORWxNXwbvu+U04mOv+os1V9eni7Hwlk/1tmlnDTGtOutX3Y3n48vNmNzpp51e9XzTSOyq9LpHKv0qqr9JqvaXsYSy8jqzMhpkW8aeT2Rq1anF3PY9JT5OWr4RFT8nfRPtz2429amHft9p/4lU5TKKrFTm2r4vVq47GqbV2naht2ldkOoL1dImT08VHIzmH9E7npuNjX4znInmppMuwlNdi5cucpjT99XrPG/Ed7DZrgsFg96qaoqmI6zPdinziZ+MPmhPE2enfC7ocmC+eR1otNQa1uOpbnTJJS2OJ1LG17ctfNM1Ux37se/+ehRKJhqJ2Jg2byQL7bJ9mV205BBHDX0Ve6qnVvTO2ZE3Xr3puKzwahx8rimu9FNfjHjDd+kK7fw2VXL+H5zHYqn/jVO/wDHvMu7SdIS6E2qXrTDmuSGlqFWmcvwoHetGv5qoniimpOSTrVLts7rdGVc2amzS85TtVeK08qqvD4r99PlNOJyv9FLLQWfX1JF60C+x1aqJ8Byq6Jy+Dt5ufw0KO2Ja19ou2uz3aaXm6Gof6DW8eHNSqiby/FduO+Sp9aP8ljdOn7T/H7NfiYjizhX1kb3YjX36Of4o10+9D6LAJ0A7S/PAcHWVRzGjqtM4WTdiTzcmfoyd4hu0SdW2mjpkz7pKr18Gp//AEBy9HWqO52W8RS4xKjYmr9yqZci+S4I22prrdHW27eWNJfcp2L2tX/3yUsHQUPN6VWRW4WWZzs9yYT9x6GptMPrdWUk1M3EdY7dmVPgq1Mq7zanzoB6lpsat2c3KtkZ7rVRK5ncxi5T51RV+Y8ez2o3L7U06rhJYd5E72r/AAcpYD6aNbc6jY1Gx83zaNTqTGMFV6UldR6zo0cipl6wu80VPrwBa880dPTSTzORscbVc5y9SJxUpu4VVTer3PVJHJJJM5VbG1FcqNToTCdiE219dVgt0Vrid69R68mOpidXmv1KeDZ/asMnu8reLvcos9nwl+fCeSgR9lfq6OFsMb7k2NrUa1qRLhEThj3pymLWW2uinWOSCeNySM5xqtXgvf1F3EU11avTLIlfG3MtKuVx1sXp+bgvzgSC2V8VztMFdD72Vucfcr1p5LlDi66/sfJ+Nj/WOHoG7LFVy2iZy7suZIs9Tk6U804+Snc10irpCTCKvusfQmfhAcjZx7+5eEf/AJE8IHs5RUfccoqcI+lPjExulLUVtonpaWpWmlkarWyInR/70AfsdRb7kyaKOSGpbG/m5G8HIi9ioQXW1htttp4K2hY2B0km46Jq+qvDOUTq6PpOFJT33Tta71amkf0b8ed16ePQqH8ql81DWt3m1NbL71FVPVanj0IgEv2dzPdbK2BV9RkrXNTsVW8fqQ/vaDQPmtdPXxtz6O5Wvx1Ndjj86J852dN2VLJZW073NfO9d+Vzeje7E7kTgdWWKOeB8MzGvjeitc1yZRUXqAgGh79BSK+1VkjY2SP34XuXCby8Favj1FhFZ3zRVdRTOmtkbqqlVcoxvF7O5U6070OMy6XyjZ6MyuroUThze85Md2F6ALL1Hfqey2x676OqpGqkMSLxz90vchANJUElw1XTuwqsgdz8jvDo+dcfSeGgsN6vVTvsglVHL61RUZRvzrxXyLLsVjprHb+YhXfkfxllVOL1/cnYgHUKeo/7bwf49P2hcJT1Gi+3eDgv/wA9P2gFm3yx0t8t6wTepK3KxSonFi/vTtQqi4UFXa66Siq2Kx7Vzw965OpydqF1nKvtipb5b+Zm9SVvGKZE4sX96dqAcHZ1/VNb+PT9VCZkV0VQVVsguFJWRKyRs6eDk3U4ovWhKgPVkuNFFcorfJUsbUytVzI1XiqJ/wC/Qpy9RWK1VtqqamaGOGaONz0qGpuqiomePaniRLUum7zBdprhHz1bG92+krOL2diKidnUqfQceSp1BcI0o5ZbjUtyic0qOXPin8QPZ0fK+PWVHuZ9fea5E7Fav8PoLaIbo/S9Rb6hbncWIybd3Yos5VqL0qvf1YJkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB69fW01ttVTca2VIqamidNLI7oaxqKrl+ZFPmZrPU9VrTaBd9UVeUfcKl0zWKvvI+hjPJiNTyNi8qnWvtd2Pt07Sy7tbfpfR1RF4pTtw6VfP1WfLUx5ojS9TrXaJaNLUu8jrhUtie9qZ5uPpkf5MRy+R1zOL03LlNinp+s/P5vc/RhltGDwN7N8RtFWsRPspp3qnzn/y2JyV9Fe13Y+uoaqLdrb9L6SiqnFKduWxJ5+s/wCWhw+VWur77b7NpDTOm7zcaVXrX1s1FSPlZlMtiYrmpjPF7lT4pomhoqa22umt9FEkVNTRNhijb0MY1ERqJ4IiHnz4m2nBxOHjDxOnz+7zWjieunO6s5rtxXV2pmImdo20p/DGmng+Yd20bq6w0CV180veLbSq9I+fq6N8TN5ehN5yYyuFJnsB1r7SduNrqKibm7fcV9jqvK4ajZFTccvxXoxfDJuDaRpGHXWy286XkRvOVdOvMPd8CZvrRu7sORvlk+ak0M1PUSU87HQzRuVj2LwVjkXCp4oqL8x1/FYacDdpqpnXr8HtfDufW+L8vxGHxFEUz/pmI32qjad+uuvnD6aa50vTa12dXjS9XhGV9M6Jr1+A/pY7ycjV8j5n1tFU2+41Nur4XQ1NPI+CaNeCse1Va5PJUU+iexjWvt92MWe9zSb9ayP0St48Unj9Vyr8bg75RlblS6K9re2T2fpod2iv0XpOUTCJOzDZU8/Ud8pTnZtbi7apxFHzEuoejbG3MuzHEZLidpmZmPvU7Tp4xv7rT2wnW3t52JWm4Ty79fSN9Arc9Kyxoiby/Gbuu+UWSYq5JutPYXadV6Rqpd2lvcW9CirwSoiRVT85m8nyUNqmyy+/66xEzzjaXRuNsn+qs2u2qY0oq71PhPTynWPIPxURyYVEXxP0HNdTfiIiJhERE7j9B+KqIiqq4TvA/T+dxmc7jc9uDM9s22LNyopqmWsxpupVLRHl3qNa1y7k3nIq5X7l3caaGg/FY1y5c1F8UP4lmgpYecmljhjRcbz3I1PpPIVLyjkRdhNWioi/73TdP4xALO9lrX98qT/vN/ieaGppqpqrTzxTInBebejvqMBaV0JqTW09VDpm0trn0rWvmTnI491HKqJ75Uz0Kee66c1xs6utPNcKK5WGpcqrBURSbiOVOndexcKqcOGTLRNW+kYxFyjGovaiH9cF6So9hG0yu13pmqt18kbJd7YrEfOiI30iJ2d16onwkVFRcdy9Zbhirl2zUWn7yqpaL1b61UVUVtNUMeqKnSioi5ToOoYL0Vw28WNyJh3s5GmU6f6c3oWY0DCKmFPxEREwiIiH6Uptr20SaMf7WdMujffJGI+aociObRsXo4db16UReCJxXOUQgt25Xm0WeDnrtdKOgjXofVTNiRfzlQ51DrjRlynSC36rs1TKvBI4qyNXL4JniYmtOmtd7S73NU0NFcL5Vb3u1ZUSZaxV6nSPXCeCL5HXvOw/aXZbc6uqtMrUwsTed6HKyoc1O3dau98yKZaJq3CfioiqiqiKqdBjDZntr1Doe4w0N1qai6WFVRklNM5XyU6fdRKvFMfcLwXuU2Pb6+jutqp7lb6hlRS1MbZYpWLlHtVMoqEmNFeyfjnNYxXOcjWomVVVwiIcfVWp7Vo/SdXqC8Sqympm53W8XSOXg1jU63KvBDG2sNo2t9qOom0DVqkp55Nyls1CrlavYionGR3aq8OxEQRGo1/Ua/0NS1CwVGsLHHKi4Vjq6PKePE61BcLVdaf0m11tHWxZ/paaRsjfnaqmQqPk5bS6m3tqH0VrpHKmUp56tEencu61URfMilxsWvtleoYp6mGvsVXn3Kqp5Pc5e5Hty1/xV80Lomrep/EssUELpppGRxsTLnvVERE7VVSN7Pa3VVx2d26u1lTQU92mj35GRNVq7q+9V7fgvVOKtTgir1dCejteRF2F6qRURU9jZeC+BiqQ0mpdO19zS3UN9ttVWbqv9HgqWSP3Uxld1FVcJlDqGPOTWjU23rhqJ/w6foT8JhsJzkYxXOVEREyqr1FmNB46iop6SmfUVU8cELEy+SVyNa1O1VXghw4deaIqa30SDV1jknzhI210aqq9iceJj3aJrzUG07Xj6aCSplt7qn0e22yNfVXLt1qq3oc93TlejOEwiHv3Pk/7S7ZY1uL7RS1aNbvPpaSoSWZifFwiOXuaqjRNW00VFTKLlD0rnebTZoWS3W5UtE2Rd1izyIzfXsTPSvgUpya4Ncpp6rqbvVy+1z+joaerRVk5xHes6NV4tjTimOhV6MYXPe1/RXKHW0lbLXrb4KllOymubmyrHAxiTc7CrolRzVc90Tulu9jpXcwFWrSVdLX0cdXRVMNTTyJvMmhej2PTtRU4KeYgezCkuEVruFbUwTU9NVyQvijmRUdJI2BjZpsKiLiSRHOyqJve+wm8TwgAAAAAAAAAAAAAAAAAAAAAAAAAAAAQrazrNugtkN61G16Nqo4VipEVffTv9WP5lXPgimNdcUUzVVyhyMJhbmLv0Ye1GtVcxEeMzoxpyitaprLblcG003OUFoT2NpsLlFVi5lcni9VTPY1CzOSBornbheNfVkOWQp7G0TnJ8JcOlcngm43zcZfjZUVVU2KNr6iomejWp0uke5cJ5qq/SfSjZrpCHQeyuzaYj3VlpadPSHp8OZ3rSO83Kvlg63ltE4nEzeq6b+fR7rx3ireR5DayrDzvXEU+7TpNU+c6a+MoDynNcP0nsZktlDUuhuN7l9DidG5WvbEnrSuRU6PVw35aGM9MU+o9V60tem7fdrj6RcallO1fSpPURy+s7p6Gty7yJ/ylNa+27bhV0VNLv0Fkb7Hw4XgsiLmV35/q/IQmfJE0V6frC6a5q4sw22P0OkVU6ZpEy9yfFZhP+oY4iqcZjOxHLl5RzfbJbNHDHC84u7THrKo7W/8AdVtRHltrHi1za7dTWmyUlqo0clPSwsgj3nby7rWo1MqvSuE6TC3KY0V7VNt1TcKaLcob4z0+JUTgkucTN/Ow75ZvQrva9smt+1nTNFbqm5OtlVRVHPw1jIUlVqK3dezdVU4Lw6+lqG5zDCzfs9miN45PLeCuIacozSL+Iq/w64mK53nnvE7eydPLVnnkj619jNdXHRNXLiC7R+k0qKvBJ409ZE+NHx/6Zd/KN0UusNh1fLTQc5cLQvslT4TLlRiLzjU8WK7zRCC6e5JsumtWW3UNt2jTNq6CpZUxZtjcKrVzhfdOhUyi9yqaTexkkSxvajmuTCtVMoqdh8cHhrn0eqxfjT2fP2NnxRnmB+u7Wb5Tc7U7TVGlUb07dYjaqnbb7fa+W1nu1bYtQUN7tkqsq6KdlTA9Pumqjk8lxjwU+mml9QUWqtGWzUducjqa4UzKhmFzu7yZVq96LlF70M813I3tFRdKmej1xV0tPJK98VP6A1/NNVyqjN7fTOEwmcdRc+yzQE+zXQbdLPv8l4p4p3ywSSQJCsTXrlWYRy5Te3l+UfHK8Nfw9dUXI7s/bHNsvSBn2T53hrV3B3dbtE8uzVHdnnvMabTEdfamwAN28pCrdvOt/ajsvmo6SbcuV23qSDC8WMVPdH+TVwne5C0lXCZMPbZ9ae3XanWVNLNv26hzRUfHLVa1V3np8Z2V8EaWISUfl0bdItl0GuHMxbpq91AiY4phuUfnsVyOb4tNc7EtcLrXZfTOq5t+527FHV5Xi5Wp6knym4XxRxTlXtc2c1Gw3/Z0yxX1sTaFII5ljh4TN9ZJff8A/wBnrL4qRHYhrf2mbUaZKubcttzxR1eV9ViqvucnyXLjPY5xZ3G2SpuUb9omr/xdN+0QtkqblG/aJq/8XTftEJCqv5Ml2tdqvmo33S5UdE2SCBGLUzNiRyo5+cbypk7PKN17pS86TotM2a5Utyrm1jamR9K9JGQNaxyYVycN5d7oRehFz1Fa7MNn8O0LTmrLfGyNLpSwQVFBK/qk3n5Yv4L0TC9nBeohdphtdLq6lptVQVkVviqObro4F3Jo2ouHYyi4VF6U7lwZabovPkr2msW9agvqsc2kSGOjRypwfJvb6ongmPzkNNnI0xabBZdKUVDpmnghtaRo+DmFy17XJnf3vhKuc5Xip1zGVYM0X9vax/l2P9ubzMGaL+3tY/y5H+3N5llIeCsqY6K3T1k2ebhjdK7HY1FVfqMEUMVw2i7VYIpplSrvlwRXyrx3Ee7Kr4NbnCfgobyu1GtxsNbb0XC1FPJDlereaqfvMH6HuiaN2rWa5XNjo2W6uRtUipxY1FWN/DuRVXyFJLdVhsVr01p6lstmpWU1HTMRkbG9faqr1uXpVetTpH8QyxT07JoJGyRvajmPYuUciplFRetFQ/sxVlrlK6FoLPdqHWNrgbAlxldBWRsbhqzIm82TxciORe1URelVJnyYtQT3HZ1cLFO9z/YuqTmlVfexyorkb5OR/wA5yOVJqOk9iLNpSKRr6p0618rUXjGxrXMbn4yudj4qnscle2Tw6V1Bd3sVIqqqjgjVfhc2xVVU85MeRl0Tq4fKl1BUSX6yaXjeqU8ULq+RqLwc9zlYzPgjX/nEm5NOjKOh0VLrOpga+vuEj4oJHJlY4GLu4b2bzkVV7kaQrlR2uaDaHZ7wrF5ipoFgR/VvxyKqp80iKWnydb7SXTYpSWyJ7fSbXLJTTR54pl6vY7HYqO+hewdDqmurdd6W0NT0s2prl6G2qe5kOInyK5WpleDUVcJlOPeQ2t247G7jTpBcLxHVRNe2RI57dM9qOauWuwrOlFRFRT19rOx+8bStS0VdFqSnoKSjp1ijp307pF3nOy52UcnThqeRRG0zY5WbNbFRXKpv0FwSqqPR0jjp3Rq1d1XZyrlz0EiIGtNJa301rigqKzTNetZDTypDK5YXx7rlajsYciZ4Khy9rv2jNVfk2X6it+Sv/Ye//lFv7FpZG137RmqvybL9Q6qzlybPt3r+Tp/1mGvaqFKmimp1crUkY5iqnSmUwZC5Nn271/J0/wCsw2EKuaQ+flO+67P9pUUktM1LjZa5HLDMi7rnMd19zk4oqdSoqGotM8o7QV5bHDeHVNiqXcFSqZvw57pG9Xe5EJZrjZXo/X6JLeqF0dc1u6yvpXc3MidirhUcnc5F7sGdNo2wC86KstRf7Vc2Xa106b8yOZzc8LPulRMo5E61TC9eC7SNdUtTS1lHHV0VRFUU8rd+OWJyOY9F60VOCoeYyryZ9YXCk1rPoyaeSS31kD6iCJVykMrMKqt7Ec3OU7URe01USY0UABAAAAAAAAAAAAAAAAAAAAAAAAAAAAyFyvda+majtOg6SXMVEz0+sai/816K2Nq+DN53y0NelMam5M2hNW6vuOpbxddRPra+ZZpdyqYjUXoRrU5vg1EREROxDg5hau3rXq7XXn4O28F5jgMtzGMZj5nSiJ7Oka96dvyjXz0YbtF1rbFfqO822RkdZRzNnge+NsiNe1ctXdciouF48ULLXlK7Z1bj23R/5fT/AOg0H9iJsy++Wpf0uP8Alj7ETZl98tS/pcf8s01vLcZbjSidPCXqeM464XxtUVYq125jl2rcTp8WJ5ZZJ55J5nukkkcr3vcuVc5Vyqr3qqk90jtq2iaF00ywaYu9NR0DZHy82tFFIqvcuVVXOaqqv7kQ039iJsy++Wpf0uP+WPsRNmX3y1L+lx/yzGjK8XbntUTpPi+uL9IPDeMt+qxNE1089JoiY+EqC+yb2y/3mpf8ug/0j7JvbL/eal/y6D/SX79iJsy++Wpf0uP+WPsRNmX3y1L+lx/yz7fQ8w/vn8Utb/VHBn+1p/6qVBfZN7Zf7zUv+XQf6TRHJw2uXjaPZLvbtVVkNReqCVsrZGRNi5yB6YT1Woieq5HIq97T1PsRNmX3y1L+lx/yyUaA2BaQ2cawTUenrnfVqeZfTviqahj45GOxlHIjEXgqIqcelDkYXD423diq5VrHXdpOIs64VxuAuWcFZ7F3nTMW4p3jprHSeX5rVABu3k4AAKw2664XR2y+eCkm3LndM0dNhfWYip7pIng1fnc0obYdstoNoFzuNZfo5/YiiY2JEhkWNZJncURHJ1NamV+M00RrvZDp3aHeqe5X64XdjqeHmYoaaZrI2oq5VcK1eKrjK56kJBozRtm0JpWOwWNs3o7ZHSukncjpJHuXKucqImV6E6OhELrsiCfY37Mv/wAdz/TnlJbcdllBs+ulurLCyf2IrWOiVJpFkWOZvFU3l6nNVFT4rjZBwNZaOs+utKS2C9tm9He9kjZIXI2SNzVyjmqqLhelOjoVREmiJ7DtcLrPZhAyrm37pbMUdVleL8J6ki/Gb9KOPR5Rv2iav/F037RDs6E2Q6d2eXuouVhuF3c6oi5mWGpma+N6Zyi4RqcUXOF717SQay0fatc6Vk0/eZKplJJIyVVpnox+WrlOKovX3DqqgeSr/X+pv8PT/rvPzlH7OForimv7RB/u9Q5sdxYxPeSdDZfB3Bq9+F61Ln0Hsq01s6q66osM1wkfWMYyX0uZsiIjVVUxhqY98pLbnbaK8WeqtVyp2VFJVROhmienBzVTCoNd0Z55OO0tVxs9vVR0Ir7XI9erpdDnu4ub3bydSGkSutObDtnOmquCtpbNJVVkD2yRVVbO+V7HIuUVEyjUXPcWKJV8+7Tdo7DtNpL5NC+eOhuaVLomKiOejJVcqIq8EXgaD+yqsX90bp/34jtTcmbQE9TJO+vvyOke564qWYyq5X4Hefx9jDs+++F//SY/9BdYRI9mm2GzbSbhXUFJbqm31VLG2Xmqh7Xc4xVwrkVvYuEXxQqXb7skrqa91OutOUb6ijqV5y4U8Lcuhk65UROlrul3YuV6F4WnpHYZpTRWrKfUNmuV7SqgRzd2adjmPa5MK1yIxMp1+KIWcTXTkrFuz7bpqrQ1tjtL4obxaY/6KnqHq18KdjJEz6vcqKidWCZXnlT3apt74bFpanoahyKiT1VQs+53oxGtRV8VLb1LsP2c6nrH1lTZVoap65fPbpFgV69qtT1VXvwcSh5Nezekqmyztu1c1FzzVRV4YvjuI1fpLrCM12HT+r9q2vZGQvmr6+oeklXXz8WQt6N969CIidDU6cIiIba0npm3aP0dQ6dtbV9HpI93fd76Ry8XPd3uVVVfE9qzWKzadtbLdY7ZTW+lZ0RU8aMRV7Vx0r3rxOgSZ1VC9qGgafaHoOazrIyCtidz9FUOTKRyoi4RfwXIqtXxz1GQbVd9a7I9fS81HLbblD7nUUtQ3ejnZnoVOh7V6Uci96KbyOHqXR+mdX0LaTUlmpbhGzix0jcPj+K9MOb5KIlFIUfKrpPY9vsho6p9LROPo9U1Y3L3byZT6Srdp21+7bSY6akqbbS263UsqzRRMcsj1cqK3LnrjqVeCInmXzPyZtnMtQskct7gaq55qOrRWp4K5qr9JJ9N7GdnWmJ46mh09FUVUfFtRXOWoei9qb3BF8EQusCHcmWzXW2bO7lVXGgnpYq2tSamWZu6srEja3eRF44yi4XrJztd+0Zqr8my/UTXGDmaisVHqbStfYLg+ZlLXQugldC5GvRq9OFVFwvkYqyhybPt3r+Tp/1mGvqiV0NJLMyGSZzGK5Io8bz1RM7qZVEyvRxUrzROxXSeg9ULfrPVXWWp5l8G7VTNezdcqKvBGpx9VCxyzJDIruUJre37U6y7VtG5KDK0z7DOqxpA1qrhM4ykqccuVOOcYwiY6Gv+UX7adDVenrNp+agdXRrDUVFTM16tYvvmsRqdKpwyvQirwL21jsq0Rrif0q92hErcI302mesMyonUrk998pFIpQcmzZtR1rZ547rXsaueZqav1F8dxGqvzjWEVZyadK19ftEl1Y6JzLfboZIWyqnCSaRMbqduG5VezKdprI9S22y32e1w221UUFHSQt3Y4IGIxjU7kQ9sTOqgAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/9k=';
const cp1252Extra = {
    '€': 0x80, '‚': 0x82, 'ƒ': 0x83, '„': 0x84, '…': 0x85, '†': 0x86, '‡': 0x87,
    'ˆ': 0x88, '‰': 0x89, 'Š': 0x8a, '‹': 0x8b, 'Œ': 0x8c, 'Ž': 0x8e, '‘': 0x91,
    '’': 0x92, '“': 0x93, '”': 0x94, '•': 0x95, '–': 0x96, '—': 0x97, '˜': 0x98,
    '™': 0x99, 'š': 0x9a, '›': 0x9b, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f,
};
const toCp1252Byte = (character) => {
    const extra = cp1252Extra[character];
    if (extra !== undefined)
        return extra;
    const code = character.codePointAt(0) ?? 63;
    if (code >= 32 && code <= 255)
        return code;
    const simplified = character.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const simplifiedCode = simplified.codePointAt(0);
    return simplifiedCode && simplifiedCode >= 32 && simplifiedCode <= 126 ? simplifiedCode : 63;
};
const pdfHex = (value) => `<${Array.from(value).map((character) => toCp1252Byte(character).toString(16).padStart(2, '0')).join('')}>`;
const base64ToHex = (value) => {
    const binary = atob(value);
    let output = '';
    for (let index = 0; index < binary.length; index += 1) {
        output += binary.charCodeAt(index).toString(16).padStart(2, '0');
    }
    return output;
};
const number = (value) => Number(value.toFixed(2)).toString();
const color = (hex) => {
    const normalized = hex.replace('#', '');
    return [0, 2, 4].map((offset) => parseInt(normalized.slice(offset, offset + 2), 16) / 255);
};
const COLORS = {
    red: color('#c51a2e'),
    redDark: color('#9f1525'),
    dark: color('#272a2f'),
    text: color('#2f3338'),
    muted: color('#777c84'),
    border: color('#d7d9dd'),
    borderStrong: color('#b9bdc3'),
    soft: color('#f8f9fa'),
    cream: color('#fffdfa'),
    meta: color('#f5f5f2'),
    white: [1, 1, 1],
};
const estimateTextWidth = (value, fontSize, bold = false) => {
    const factor = bold ? 1.04 : 1;
    return Array.from(value).reduce((width, character) => {
        if (character === ' ')
            return width + fontSize * 0.28;
        if ("ilI.,'!:;|".includes(character))
            return width + fontSize * 0.25;
        if ('MW@%&'.includes(character))
            return width + fontSize * 0.82;
        if (/[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ]/.test(character))
            return width + fontSize * 0.62 * factor;
        if (/[0-9]/.test(character))
            return width + fontSize * 0.56 * factor;
        return width + fontSize * 0.5 * factor;
    }, 0);
};
const truncateText = (value, maxWidth, fontSize, bold = false) => {
    const cleaned = value.replace(/\s+/g, ' ').trim() || '—';
    if (estimateTextWidth(cleaned, fontSize, bold) <= maxWidth)
        return cleaned;
    let output = cleaned;
    while (output.length > 1 && estimateTextWidth(`${output}…`, fontSize, bold) > maxWidth)
        output = output.slice(0, -1);
    return `${output.trimEnd()}…`;
};
const wrapText = (value, maxWidth, fontSize, bold = false, maxLines = 2) => {
    const words = value.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    if (!words.length)
        return ['—'];
    const lines = [];
    let current = '';
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (!current || estimateTextWidth(candidate, fontSize, bold) <= maxWidth) {
            current = candidate;
            continue;
        }
        lines.push(current);
        current = word;
        if (lines.length === maxLines - 1)
            break;
    }
    if (current && lines.length < maxLines)
        lines.push(current);
    const consumed = lines.join(' ').split(' ').length;
    if (consumed < words.length)
        lines[lines.length - 1] = truncateText(`${lines[lines.length - 1]} ${words.slice(consumed).join(' ')}`, maxWidth, fontSize, bold);
    return lines.slice(0, maxLines);
};
const formatIsoWeek = (value) => {
    const parsed = new Date(`${value}T12:00:00`);
    if (Number.isNaN(parsed.getTime()))
        return value || '—';
    const target = new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return `S ${week}`;
};
const statusLabels = {
    todo: 'À planifier',
    scheduled: 'Planifiée',
    in_progress: 'En cours',
    done: 'Terminée',
    blocked: 'Bloquée',
};
function createArtisanPlanningPdf({ artisan, rows }) {
    const availableRowsHeight = PAGE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM - HEADER_HEIGHT - SECTION_GAP - INFO_HEIGHT - SECTION_GAP - TABLE_HEADER_HEIGHT - FOOTER_HEIGHT;
    const rowsPerPage = Math.max(1, Math.floor(availableRowsHeight / ROW_HEIGHT));
    const chunks = rows.length
        ? Array.from({ length: Math.ceil(rows.length / rowsPerPage) }, (_, index) => rows.slice(index * rowsPerPage, (index + 1) * rowsPerPage))
        : [[]];
    const pages = chunks.map(() => ({ commands: [] }));
    const fixedWidths = [28, 35, 42, 58, 38, 24].map((value) => value * MM);
    const columns = [
        { label: 'SEMAINE', width: fixedWidths[0] },
        { label: 'CHANTIER', width: fixedWidths[1] },
        { label: 'CLIENT', width: fixedWidths[2] },
        { label: 'ADRESSE / VILLE', width: fixedWidths[3] },
        { label: 'ÉTAPE', width: fixedWidths[4] },
        { label: 'STATUT', width: fixedWidths[5] },
        { label: 'NOTE', width: CONTENT_WIDTH - fixedWidths.reduce((sum, value) => sum + value, 0) },
    ];
    const addCommand = (page, command) => page.commands.push(command);
    const fillRect = (page, x, yTop, width, height, rgb) => {
        addCommand(page, `${rgb.map(number).join(' ')} rg ${number(x)} ${number(PAGE_HEIGHT - yTop - height)} ${number(width)} ${number(height)} re f`);
    };
    const strokeRect = (page, x, yTop, width, height, rgb, lineWidth = .6) => {
        addCommand(page, `${rgb.map(number).join(' ')} RG ${number(lineWidth)} w ${number(x)} ${number(PAGE_HEIGHT - yTop - height)} ${number(width)} ${number(height)} re S`);
    };
    const drawLine = (page, x1, yTop1, x2, yTop2, rgb, lineWidth = .6) => {
        addCommand(page, `${rgb.map(number).join(' ')} RG ${number(lineWidth)} w ${number(x1)} ${number(PAGE_HEIGHT - yTop1)} m ${number(x2)} ${number(PAGE_HEIGHT - yTop2)} l S`);
    };
    const drawText = (page, value, x, yTop, fontSize, bold = false, rgb = COLORS.text) => {
        addCommand(page, `BT /${bold ? 'F2' : 'F1'} ${number(fontSize)} Tf ${rgb.map(number).join(' ')} rg 1 0 0 1 ${number(x)} ${number(PAGE_HEIGHT - yTop - fontSize)} Tm ${pdfHex(value)} Tj ET`);
    };
    const drawCenteredText = (page, value, x, width, yTop, fontSize, bold = false, rgb = COLORS.text) => {
        drawText(page, value, x + Math.max(0, (width - estimateTextWidth(value, fontSize, bold)) / 2), yTop, fontSize, bold, rgb);
    };
    const drawWrappedText = (page, value, x, yTop, maxWidth, fontSize, bold = false, rgb = COLORS.text, maxLines = 2, lineHeight = fontSize * 1.18) => {
        wrapText(value, maxWidth, fontSize, bold, maxLines).forEach((line, index) => drawText(page, line, x, yTop + index * lineHeight, fontSize, bold, rgb));
    };
    const drawImage = (page, x, yTop, width, height) => {
        addCommand(page, `q ${number(width)} 0 0 ${number(height)} ${number(x)} ${number(PAGE_HEIGHT - yTop - height)} cm /Im1 Do Q`);
    };
    pages.forEach((page, pageIndex) => {
        fillRect(page, 0, 0, PAGE_WIDTH, PAGE_HEIGHT, COLORS.white);
        let cursorY = MARGIN_TOP;
        const brandWidth = 64 * MM;
        const metaWidth = 54 * MM;
        const titleWidth = CONTENT_WIDTH - brandWidth - metaWidth;
        fillRect(page, MARGIN_X, cursorY, brandWidth, HEADER_HEIGHT, COLORS.cream);
        fillRect(page, MARGIN_X + brandWidth, cursorY, titleWidth, HEADER_HEIGHT, COLORS.white);
        fillRect(page, MARGIN_X + brandWidth + titleWidth, cursorY, metaWidth, HEADER_HEIGHT, COLORS.meta);
        strokeRect(page, MARGIN_X, cursorY, CONTENT_WIDTH, HEADER_HEIGHT, COLORS.border, .7);
        drawLine(page, MARGIN_X + brandWidth, cursorY, MARGIN_X + brandWidth, cursorY + HEADER_HEIGHT, COLORS.border, .55);
        drawLine(page, MARGIN_X + brandWidth + titleWidth, cursorY, MARGIN_X + brandWidth + titleWidth, cursorY + HEADER_HEIGHT, COLORS.border, .55);
        const logoBoxWidth = 58 * MM;
        const logoBoxHeight = 21 * MM;
        const logoRatio = LOGO_WIDTH / LOGO_HEIGHT;
        const renderedLogoHeight = logoBoxHeight;
        const renderedLogoWidth = Math.min(logoBoxWidth, renderedLogoHeight * logoRatio);
        drawImage(page, MARGIN_X + (brandWidth - renderedLogoWidth) / 2, cursorY + (HEADER_HEIGHT - renderedLogoHeight) / 2, renderedLogoWidth, renderedLogoHeight);
        const titleX = MARGIN_X + brandWidth + 5 * MM;
        drawText(page, "CONDUCT'HOME · PLANNING ENTREPRISE", titleX, cursorY + 6 * MM, 5, true, COLORS.redDark);
        drawText(page, truncateText(`Planning prévisionnel — ${artisan.company || 'Entreprise'}`, titleWidth - 10 * MM, 17, true), titleX, cursorY + 10.4 * MM, 17, true, color('#25282d'));
        drawText(page, 'Prochaines interventions programmées sur les chantiers Maisons ARLOGIS.', titleX, cursorY + 20.2 * MM, 7, false, color('#6a6e75'));
        const metaX = MARGIN_X + brandWidth + titleWidth;
        drawCenteredText(page, "DATE D'ÉDITION", metaX, metaWidth, cursorY + 6.2 * MM, 5, true, color('#858990'));
        const editionDate = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date());
        drawCenteredText(page, editionDate, metaX, metaWidth, cursorY + 11 * MM, 8, true, color('#2c2f34'));
        drawCenteredText(page, "Document à transmettre à l'entreprise", metaX, metaWidth, cursorY + 17.3 * MM, 5, false, color('#9a9da3'));
        cursorY += HEADER_HEIGHT + SECTION_GAP;
        const infoGap = 2 * MM;
        const infoAvailable = CONTENT_WIDTH - infoGap * 2;
        const infoRatios = [1.3, 1, .8];
        const ratioTotal = infoRatios.reduce((sum, value) => sum + value, 0);
        const infoWidths = infoRatios.map((value) => infoAvailable * value / ratioTotal);
        const infoCards = [
            { label: 'ENTREPRISE', strong: artisan.company || 'Entreprise', small: artisan.contactName || 'Contact non renseigné' },
            { label: 'TÉLÉPHONE', strong: artisan.phone || '—', small: artisan.email || artisan.orderEmail || 'E-mail non renseigné' },
            { label: 'INTERVENTIONS À VENIR', strong: String(rows.length), small: 'hors étapes terminées' },
        ];
        let infoX = MARGIN_X;
        infoCards.forEach((card, index) => {
            const width = infoWidths[index];
            fillRect(page, infoX, cursorY, width, INFO_HEIGHT, COLORS.soft);
            fillRect(page, infoX, cursorY, 1.6 * MM, INFO_HEIGHT, COLORS.red);
            strokeRect(page, infoX, cursorY, width, INFO_HEIGHT, color('#dfe1e4'), .55);
            drawText(page, card.label, infoX + 4.5 * MM, cursorY + 3 * MM, 5, true, COLORS.muted);
            drawText(page, truncateText(card.strong, width - 8 * MM, 12, true), infoX + 4.5 * MM, cursorY + 6.5 * MM, 12, true, color('#282b30'));
            drawText(page, truncateText(card.small, width - 8 * MM, 6), infoX + 4.5 * MM, cursorY + 11.2 * MM, 6, false, color('#737780'));
            infoX += width + infoGap;
        });
        cursorY += INFO_HEIGHT + SECTION_GAP;
        let columnX = MARGIN_X;
        columns.forEach((column) => {
            fillRect(page, columnX, cursorY, column.width, TABLE_HEADER_HEIGHT, COLORS.dark);
            drawText(page, column.label, columnX + 2 * MM, cursorY + 3 * MM, 6, true, COLORS.white);
            drawLine(page, columnX + column.width, cursorY, columnX + column.width, cursorY + TABLE_HEADER_HEIGHT, color('#454950'), .45);
            columnX += column.width;
        });
        strokeRect(page, MARGIN_X, cursorY, CONTENT_WIDTH, TABLE_HEADER_HEIGHT, COLORS.borderStrong, .65);
        cursorY += TABLE_HEADER_HEIGHT;
        const pageRows = chunks[pageIndex];
        if (!pageRows.length) {
            const emptyHeight = 28 * MM;
            strokeRect(page, MARGIN_X, cursorY, CONTENT_WIDTH, emptyHeight, COLORS.borderStrong, .6);
            drawCenteredText(page, 'Aucune intervention future programmée avec cette entreprise.', MARGIN_X, CONTENT_WIDTH, cursorY + 11 * MM, 8, true, COLORS.muted);
            cursorY += emptyHeight;
        }
        else {
            pageRows.forEach((row, rowIndex) => {
                const background = rowIndex % 2 === 1 ? COLORS.soft : COLORS.white;
                fillRect(page, MARGIN_X, cursorY, CONTENT_WIDTH, ROW_HEIGHT, background);
                strokeRect(page, MARGIN_X, cursorY, CONTENT_WIDTH, ROW_HEIGHT, color('#d7d9dc'), .42);
                const address = row.project.address
                    ? `${row.project.address} · ${row.project.postalCode ?? ''} ${row.project.city ?? ''}`.trim()
                    : row.project.city || '—';
                const values = [
                    formatIsoWeek(row.plannedDate),
                    row.project.name || 'Sans nom',
                    row.project.clientName || '—',
                    address,
                    row.definition.label || '—',
                    row.overdue ? 'En retard' : statusLabels[row.stage.status],
                    row.stage.note || '—',
                ];
                let cellX = MARGIN_X;
                values.forEach((value, columnIndex) => {
                    const column = columns[columnIndex];
                    if (columnIndex > 0)
                        drawLine(page, cellX, cursorY, cellX, cursorY + ROW_HEIGHT, color('#cfd2d6'), .35);
                    if (columnIndex === 0) {
                        drawText(page, truncateText(value, column.width - 4 * MM, 7.5, true), cellX + 2 * MM, cursorY + 4.1 * MM, 7.5, true, COLORS.redDark);
                    }
                    else if (columnIndex === 5) {
                        const statusColors = row.overdue
                            ? { bg: color('#fff0f1'), fg: color('#a61f2e') }
                            : row.stage.status === 'in_progress'
                                ? { bg: color('#fff7e6'), fg: color('#9a5a09') }
                                : row.stage.status === 'scheduled'
                                    ? { bg: color('#eef5fb'), fg: color('#285f89') }
                                    : row.stage.status === 'blocked'
                                        ? { bg: color('#fff0f1'), fg: color('#a61f2e') }
                                        : { bg: color('#eef2f7'), fg: color('#434851') };
                        const label = truncateText(value, column.width - 4 * MM, 5.5, true);
                        const pillWidth = Math.min(column.width - 4 * MM, estimateTextWidth(label, 5.5, true) + 3 * MM);
                        fillRect(page, cellX + 2 * MM, cursorY + 3.7 * MM, pillWidth, 5.5 * MM, statusColors.bg);
                        drawText(page, label, cellX + 3 * MM, cursorY + 5.1 * MM, 5.5, true, statusColors.fg);
                    }
                    else {
                        const fontSize = 7;
                        drawWrappedText(page, value, cellX + 2 * MM, cursorY + 3.2 * MM, column.width - 4 * MM, fontSize, false, COLORS.text, 2, 8.2);
                    }
                    cellX += column.width;
                });
                cursorY += ROW_HEIGHT;
            });
        }
        const footerY = PAGE_HEIGHT - MARGIN_BOTTOM - (FOOTER_HEIGHT - FOOTER_GAP);
        drawLine(page, MARGIN_X, footerY - FOOTER_TOP_PADDING, MARGIN_X + CONTENT_WIDTH, footerY - FOOTER_TOP_PADDING, color('#d4d6da'), .55);
        const observationWidth = Math.max(80 * MM, CONTENT_WIDTH * .72);
        drawText(page, 'Observations entreprise', MARGIN_X, footerY, 6, true, color('#555b64'));
        strokeRect(page, MARGIN_X, footerY + 4 * MM, observationWidth, OBSERVATION_HEIGHT, color('#c8ccd1'), .55);
        const footerText = "Planning indicatif généré depuis Conduct'Home · À confirmer avec le conducteur de travaux";
        drawWrappedText(page, footerText, MARGIN_X + observationWidth + 5 * MM, footerY + 7 * MM, CONTENT_WIDTH - observationWidth - 5 * MM, 5, false, color('#8c9096'), 2, 6.2);
        if (pages.length > 1)
            drawText(page, `Page ${pageIndex + 1}/${pages.length}`, PAGE_WIDTH - MARGIN_X - 28, PAGE_HEIGHT - MARGIN_BOTTOM - 6, 5, true, color('#8c9096'));
    });
    const logoHex = base64ToHex(LOGO_JPEG_BASE64);
    const objectCount = 5 + pages.length * 2;
    const objects = new Array(objectCount + 1).fill('');
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    const pageObjectNumbers = pages.map((_, index) => 6 + index * 2);
    objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((value) => `${value} 0 R`).join(' ')}] /Count ${pages.length} >>`;
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    objects[5] = `<< /Type /XObject /Subtype /Image /Width ${LOGO_WIDTH} /Height ${LOGO_HEIGHT} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter [/ASCIIHexDecode /DCTDecode] /Length ${logoHex.length + 1} >>\nstream\n${logoHex}>\nendstream`;
    pages.forEach((page, index) => {
        const pageObjectNumber = 6 + index * 2;
        const contentObjectNumber = pageObjectNumber + 1;
        const stream = page.commands.join('\n');
        const streamLength = new TextEncoder().encode(stream).length;
        objects[pageObjectNumber] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${number(PAGE_WIDTH)} ${number(PAGE_HEIGHT)}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
        objects[contentObjectNumber] = `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`;
    });
    const encoder = new TextEncoder();
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (let index = 1; index < objects.length; index += 1) {
        offsets[index] = encoder.encode(pdf).length;
        pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
    }
    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let index = 1; index < objects.length; index += 1)
        pdf += `${offsets[index].toString().padStart(10, '0')} 00000 n \n`;
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
}
const sanitizePlanningFileName = (value) => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
exports.sanitizePlanningFileName = sanitizePlanningFileName;

},
"src/lib/artisans": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeTradeName = void 0;
exports.getLotStageIds = getLotStageIds;
exports.getArtisanPrimaryLotId = getArtisanPrimaryLotId;
exports.getArtisanStageIds = getArtisanStageIds;
exports.artisanIntervenesAtStage = artisanIntervenesAtStage;
exports.artisanBelongsToLot = artisanBelongsToLot;
exports.getArtisanStageNames = getArtisanStageNames;
exports.getArtisanLotNames = getArtisanLotNames;
exports.getUnmappedArtisanStageIds = getUnmappedArtisanStageIds;
const stages_1 = require("../data/stages");
const normalizeTradeName = (value) => value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('fr')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
exports.normalizeTradeName = normalizeTradeName;
function getLotStageIds(lot) {
    return Array.from(new Set((lot.stageIds ?? []).filter((stageId) => stages_1.STAGE_IDS.has(stageId))));
}
function getLegacyLotIds(artisan, lots) {
    const validIds = new Set(lots.map((lot) => lot.id));
    const directIds = [
        ...(Array.isArray(artisan.lotIds) ? artisan.lotIds : []),
        ...(artisan.lotId ? [artisan.lotId] : []),
    ].filter((id) => Boolean(id) && validIds.has(id));
    if (directIds.length > 0)
        return Array.from(new Set(directIds));
    const tradeParts = (artisan.trade ?? '')
        .split(/[,;/|]+/)
        .map(exports.normalizeTradeName)
        .filter(Boolean);
    return lots
        .filter((lot) => {
        const values = [lot.name, lot.code ?? ''].map(exports.normalizeTradeName).filter(Boolean);
        return values.some((value) => tradeParts.includes(value));
    })
        .map((lot) => lot.id);
}
function getArtisanPrimaryLotId(artisan, lots) {
    const validIds = new Set(lots.map((lot) => lot.id));
    if (artisan.lotId && validIds.has(artisan.lotId))
        return artisan.lotId;
    const legacyIds = Array.isArray(artisan.lotIds)
        ? Array.from(new Set(artisan.lotIds.filter((id) => validIds.has(id))))
        : [];
    // Un ancien enregistrement n'est repris automatiquement que s'il ne contient
    // qu'un seul lot explicite. Les étapes et le champ historique « trade » ne
    // doivent plus décider du classement métier.
    return legacyIds.length === 1 ? legacyIds[0] : undefined;
}
function getArtisanStageIds(artisan, lots = []) {
    const direct = Array.isArray(artisan.stageIds)
        ? artisan.stageIds.filter((stageId) => stages_1.STAGE_IDS.has(stageId))
        : [];
    if (direct.length > 0)
        return Array.from(new Set(direct));
    const legacyLotIds = getLegacyLotIds(artisan, lots);
    return Array.from(new Set(legacyLotIds.flatMap((lotId) => getLotStageIds(lots.find((lot) => lot.id === lotId) ?? { id: '', name: '' }))));
}
function artisanIntervenesAtStage(artisan, stageId, lots = []) {
    return getArtisanStageIds(artisan, lots).includes(stageId);
}
function artisanBelongsToLot(artisan, lotId, lots) {
    return getArtisanPrimaryLotId(artisan, lots) === lotId;
}
function getArtisanStageNames(artisan, lots = []) {
    const ids = getArtisanStageIds(artisan, lots);
    return stages_1.STAGES
        .filter((stage) => ids.includes(stage.id))
        .map((stage) => stage.label);
}
function getArtisanLotNames(artisan, lots) {
    const primaryLotId = getArtisanPrimaryLotId(artisan, lots);
    const primaryLot = lots.find((lot) => lot.id === primaryLotId);
    return primaryLot ? [primaryLot.name] : [];
}
function getUnmappedArtisanStageIds(artisan, lots) {
    const mapped = new Set(lots.flatMap((lot) => getLotStageIds(lot)));
    return getArtisanStageIds(artisan, lots).filter((stageId) => !mapped.has(stageId));
}

},
"src/lib/auth": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = getCurrentUser;
exports.getCurrentAccountKey = getCurrentAccountKey;
exports.onAuthUserChanged = onAuthUserChanged;
exports.createLocalAccount = createLocalAccount;
exports.loginLocalAccount = loginLocalAccount;
exports.logoutLocalAccount = logoutLocalAccount;
const firebase_1 = require("./firebase");
let activeUser = (0, firebase_1.getCachedFirebaseUser)();
function getCurrentUser() {
    return activeUser;
}
function getCurrentAccountKey() {
    return activeUser?.id;
}
async function onAuthUserChanged(callback) {
    return (0, firebase_1.onFirebaseAuthState)((user) => {
        activeUser = user;
        callback(user);
    });
}
async function createLocalAccount(emailInput, password, name) {
    const user = await (0, firebase_1.createFirebaseAccount)(emailInput, password, name);
    activeUser = user;
    return user;
}
async function loginLocalAccount(emailInput, password) {
    const user = await (0, firebase_1.loginFirebaseAccount)(emailInput, password);
    activeUser = user;
    return user;
}
async function logoutLocalAccount() {
    await (0, firebase_1.logoutFirebaseAccount)();
    activeUser = undefined;
}

},
"src/lib/calendar": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MINI_CALENDAR_HOUR_HEIGHT = exports.CALENDAR_HOUR_HEIGHT = exports.CALENDAR_END_HOUR = exports.CALENDAR_START_HOUR = void 0;
exports.localDateId = localDateId;
exports.startOfIsoWeek = startOfIsoWeek;
exports.addDays = addDays;
exports.getIsoWeek = getIsoWeek;
exports.formatCalendarDay = formatCalendarDay;
exports.formatCalendarRange = formatCalendarRange;
exports.timeToMinutes = timeToMinutes;
exports.minutesToTime = minutesToTime;
exports.getCalendarEventGeometry = getCalendarEventGeometry;
exports.defaultCalendarTimes = defaultCalendarTimes;
exports.CALENDAR_START_HOUR = 6;
exports.CALENDAR_END_HOUR = 20;
exports.CALENDAR_HOUR_HEIGHT = 52;
exports.MINI_CALENDAR_HOUR_HEIGHT = 24;
function localDateId(value = new Date()) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function startOfIsoWeek(value = new Date()) {
    const date = new Date(value);
    date.setHours(12, 0, 0, 0);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date;
}
function addDays(value, days) {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    return date;
}
function getIsoWeek(date = new Date()) {
    const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNumber = target.getUTCDay() || 7;
    target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
    const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
    return Math.ceil((((target.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
function formatCalendarDay(value) {
    return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: '2-digit', month: 'short' }).format(value);
}
function formatCalendarRange(start, end) {
    const formatter = new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long' });
    return `${formatter.format(start)} au ${formatter.format(end)}`;
}
function timeToMinutes(value) {
    const [hour, minute] = value.split(':').map(Number);
    if (!Number.isFinite(hour) || !Number.isFinite(minute))
        return exports.CALENDAR_START_HOUR * 60;
    return hour * 60 + minute;
}
function minutesToTime(value) {
    const safe = Math.max(0, Math.min(24 * 60 - 1, Math.round(value)));
    return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}
function getCalendarEventGeometry(event, hourHeight = exports.CALENDAR_HOUR_HEIGHT) {
    const start = Math.max(exports.CALENDAR_START_HOUR * 60, timeToMinutes(event.startTime));
    const end = Math.min(exports.CALENDAR_END_HOUR * 60, Math.max(start + 30, timeToMinutes(event.endTime)));
    return {
        top: ((start - exports.CALENDAR_START_HOUR * 60) / 60) * hourHeight,
        height: Math.max(30, ((end - start) / 60) * hourHeight),
    };
}
function defaultCalendarTimes(now = new Date()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const rounded = Math.ceil(currentMinutes / 30) * 30;
    const start = Math.max(exports.CALENDAR_START_HOUR * 60, Math.min((exports.CALENDAR_END_HOUR - 1) * 60, rounded));
    return { startTime: minutesToTime(start), endTime: minutesToTime(Math.min(exports.CALENDAR_END_HOUR * 60, start + 60)) };
}

},
"src/lib/cleanStart": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearConductHomeBrowserData = clearConductHomeBrowserData;
exports.performOneTimeBrowserReset = performOneTimeBrowserReset;
exports.resetConductHomeNow = resetConductHomeNow;
const RESET_MARKER = 'conduct-home-browser-reset-v1.43';
const RESET_QUERY = 'conducthome_reset_done';
const APP_KEY_PATTERNS = [
    /^conduct-home/i,
    /^firebase/i,
    /^firestore/i,
];
const APP_DATABASES = [
    'conduct-home-files-v1.2-clean',
    'firebaseLocalStorageDb',
    'firebase-installations-database',
    'firebase-messaging-database',
];
const matchesAppKey = (key) => APP_KEY_PATTERNS.some((pattern) => pattern.test(key));
const clearMatchingStorage = (storage) => {
    const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
        .filter((key) => Boolean(key));
    keys.filter(matchesAppKey).forEach((key) => storage.removeItem(key));
};
const deleteDatabase = (name) => new Promise((resolve) => {
    try {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
    }
    catch {
        resolve();
    }
});
async function clearConductHomeBrowserData() {
    clearMatchingStorage(localStorage);
    clearMatchingStorage(sessionStorage);
    await Promise.all(APP_DATABASES.map(deleteDatabase));
    if ('caches' in window) {
        try {
            const names = await caches.keys();
            await Promise.all(names.filter((name) => /conduct|home|vite|workbox/i.test(name)).map((name) => caches.delete(name)));
        }
        catch {
            // Le cache n'empêche pas la remise à zéro.
        }
    }
    if ('serviceWorker' in navigator) {
        try {
            const registrations = await navigator.serviceWorker.getRegistrations();
            await Promise.all(registrations.map((registration) => registration.unregister()));
        }
        catch {
            // Les service workers ne sont pas utilisés sur toutes les installations.
        }
    }
}
async function performOneTimeBrowserReset() {
    const url = new URL(window.location.href);
    if (url.searchParams.get(RESET_QUERY) === '1') {
        url.searchParams.delete(RESET_QUERY);
        window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
        localStorage.setItem(RESET_MARKER, 'done');
        return false;
    }
    if (localStorage.getItem(RESET_MARKER) === 'done')
        return false;
    const hash = window.location.hash;
    await clearConductHomeBrowserData();
    localStorage.setItem(RESET_MARKER, 'done');
    url.searchParams.set(RESET_QUERY, '1');
    window.location.replace(`${url.pathname}${url.search}${hash}`);
    return true;
}
async function resetConductHomeNow() {
    const hash = window.location.hash;
    await clearConductHomeBrowserData();
    const url = new URL(window.location.href);
    url.searchParams.set(RESET_QUERY, '1');
    window.location.replace(`${url.pathname}${url.search}${hash}`);
}

},
"src/lib/firebase": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedFirebaseUser = getCachedFirebaseUser;
exports.onFirebaseAuthState = onFirebaseAuthState;
exports.createFirebaseAccount = createFirebaseAccount;
exports.loginFirebaseAccount = loginFirebaseAccount;
exports.logoutFirebaseAccount = logoutFirebaseAccount;
exports.loadUserWorkspace = loadUserWorkspace;
exports.saveUserWorkspace = saveUserWorkspace;
exports.loadUserDismissedAlerts = loadUserDismissedAlerts;
exports.saveUserDismissedAlerts = saveUserDismissedAlerts;
const firebaseConfig = {
    apiKey: 'AIzaSyCwKzDrHHF3NkBEM5LM2SYkkhMgfekO4NM',
    authDomain: 'arlogis-conduc-home.firebaseapp.com',
    projectId: 'arlogis-conduc-home',
    storageBucket: 'arlogis-conduc-home.firebasestorage.app',
    messagingSenderId: '1068108641159',
    appId: '1:1068108641159:web:3806cbec9845128ee49922',
    measurementId: 'G-7C1NR343KE',
};
const FIREBASE_API_KEY = firebaseConfig.apiKey;
const FIREBASE_PROJECT_ID = firebaseConfig.projectId;
const SESSION_KEY = 'conduct-home-firebase-rest-session-v1';
let activeSession = loadSession();
let authListeners = [];
function loadSession() {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw)
        return undefined;
    try {
        const value = JSON.parse(raw);
        return value?.id && value?.idToken && value?.refreshToken ? value : undefined;
    }
    catch {
        return undefined;
    }
}
function saveSession(session) {
    activeSession = session;
    if (session)
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else
        localStorage.removeItem(SESSION_KEY);
    const user = session ? publicUser(session) : undefined;
    authListeners.forEach((listener) => listener(user));
}
function publicUser(session) {
    return {
        id: session.id,
        email: session.email,
        name: session.name,
        createdAt: session.createdAt,
    };
}
function firebaseErrorMessage(error) {
    const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
    const message = typeof error === 'object' && error && 'message' in error ? String(error.message) : String(error ?? '');
    if (code.includes('auth/email-already-in-use') || message.includes('EMAIL_EXISTS'))
        return 'Un compte existe déjà avec cette adresse e-mail. Utilise Connexion.';
    if (code.includes('auth/invalid-email') || message.includes('INVALID_EMAIL'))
        return 'Adresse e-mail invalide.';
    if (code.includes('auth/weak-password') || message.includes('WEAK_PASSWORD'))
        return 'Le mot de passe doit contenir au moins 6 caractères.';
    if (code.includes('auth/operation-not-allowed') || message.includes('OPERATION_NOT_ALLOWED'))
        return 'La création de compte Email/Password n’est pas activée dans Firebase Authentication.';
    if (code.includes('auth/admin-restricted-operation') || message.includes('ADMIN_ONLY_OPERATION'))
        return 'Firebase bloque la création de compte depuis le site. Vérifie que la création d’utilisateurs est autorisée.';
    if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found') || message.includes('INVALID_LOGIN_CREDENTIALS') || message.includes('INVALID_PASSWORD')) {
        return 'Adresse e-mail ou mot de passe incorrect.';
    }
    if (code.includes('auth/unauthorized-domain'))
        return 'Le domaine du site n’est pas autorisé dans Firebase Authentication.';
    if (code.includes('auth/too-many-requests') || message.includes('TOO_MANY_ATTEMPTS_TRY_LATER'))
        return 'Trop de tentatives. Réessaie un peu plus tard.';
    if (message.includes('PERMISSION_DENIED'))
        return 'Accès Firestore refusé. Vérifie les règles de sécurité Firebase.';
    return 'Action Firebase impossible. Vérifie la configuration Authentication / Firestore.';
}
async function firebaseIdentityRequest(endpoint, body) {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/${endpoint}?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const payload = await response.json().catch(() => undefined);
    if (!response.ok) {
        const restMessage = payload?.error?.message ? String(payload.error.message) : 'FIREBASE_AUTH_FAILED';
        throw new Error(firebaseErrorMessage({ message: restMessage }));
    }
    return payload;
}
async function refreshIdToken() {
    if (!activeSession?.refreshToken)
        return undefined;
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: activeSession.refreshToken,
        }).toString(),
    });
    const payload = await response.json().catch(() => undefined);
    if (!response.ok) {
        saveSession(undefined);
        return undefined;
    }
    const next = {
        ...activeSession,
        idToken: String(payload.id_token),
        refreshToken: String(payload.refresh_token ?? activeSession.refreshToken),
        expiresAt: Date.now() + Math.max(30, Number(payload.expires_in ?? 3600) - 60) * 1000,
    };
    activeSession = next;
    localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    return next;
}
async function getValidSession() {
    if (!activeSession)
        return undefined;
    if (activeSession.expiresAt > Date.now() + 30000)
        return activeSession;
    return refreshIdToken();
}
function getCachedFirebaseUser() {
    return activeSession ? publicUser(activeSession) : undefined;
}
async function onFirebaseAuthState(callback) {
    authListeners.push(callback);
    callback(activeSession ? publicUser(activeSession) : undefined);
    if (activeSession && activeSession.expiresAt <= Date.now() + 30000) {
        void refreshIdToken().then((session) => callback(session ? publicUser(session) : undefined));
    }
    return () => {
        authListeners = authListeners.filter((listener) => listener !== callback);
    };
}
async function createFirebaseAccount(emailInput, password, name) {
    const email = emailInput.trim().toLowerCase();
    if (!email || !email.includes('@'))
        throw new Error('Adresse e-mail invalide.');
    if (password.length < 6)
        throw new Error('Le mot de passe doit contenir au moins 6 caractères.');
    const signUp = await firebaseIdentityRequest('accounts:signUp', { email, password, returnSecureToken: true });
    let displayName = name?.trim() || undefined;
    if (displayName) {
        await firebaseIdentityRequest('accounts:update', {
            idToken: signUp.idToken,
            displayName,
            returnSecureToken: false,
        });
    }
    const session = {
        id: signUp.localId,
        email: signUp.email,
        name: displayName,
        createdAt: new Date().toISOString(),
        idToken: signUp.idToken,
        refreshToken: signUp.refreshToken,
        expiresAt: Date.now() + Math.max(30, Number(signUp.expiresIn ?? 3600) - 60) * 1000,
    };
    saveSession(session);
    return publicUser(session);
}
async function loginFirebaseAccount(emailInput, password) {
    const email = emailInput.trim().toLowerCase();
    const login = await firebaseIdentityRequest('accounts:signInWithPassword', { email, password, returnSecureToken: true });
    const session = {
        id: login.localId,
        email: login.email,
        name: login.displayName || undefined,
        createdAt: new Date().toISOString(),
        idToken: login.idToken,
        refreshToken: login.refreshToken,
        expiresAt: Date.now() + Math.max(30, Number(login.expiresIn ?? 3600) - 60) * 1000,
    };
    saveSession(session);
    return publicUser(session);
}
async function logoutFirebaseAccount() {
    saveSession(undefined);
}
function firestoreValueToJs(value) {
    if (!value)
        return undefined;
    if ('nullValue' in value)
        return null;
    if ('booleanValue' in value)
        return value.booleanValue;
    if ('integerValue' in value)
        return Number(value.integerValue);
    if ('doubleValue' in value)
        return value.doubleValue;
    if ('timestampValue' in value)
        return value.timestampValue;
    if ('stringValue' in value)
        return value.stringValue;
    if ('arrayValue' in value)
        return (value.arrayValue?.values ?? []).map(firestoreValueToJs);
    if ('mapValue' in value) {
        const result = {};
        const fields = value.mapValue?.fields ?? {};
        Object.entries(fields).forEach(([key, child]) => {
            result[key] = firestoreValueToJs(child);
        });
        return result;
    }
    return undefined;
}
async function firestoreRequest(path, options = {}) {
    const session = await getValidSession();
    if (!session)
        throw new Error('Session Firebase expirée. Reconnecte-toi.');
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.idToken}`,
            ...(options.headers ?? {}),
        },
    });
    if (response.status === 404)
        return undefined;
    const payload = await response.json().catch(() => undefined);
    if (!response.ok) {
        const restMessage = payload?.error?.message ? String(payload.error.message) : 'FIRESTORE_FAILED';
        throw new Error(firebaseErrorMessage({ message: restMessage }));
    }
    return payload;
}
function parseWorkspaceDocument(document) {
    if (!document?.fields)
        return undefined;
    const jsonValue = document.fields.workspaceJson?.stringValue;
    if (jsonValue) {
        try {
            return JSON.parse(jsonValue);
        }
        catch {
            return undefined;
        }
    }
    return firestoreValueToJs(document.fields.workspace);
}
async function loadUserWorkspace(userId) {
    // Nouveau chemin : un document par utilisateur. Il correspond aux règles
    // Firestore les plus courantes : /users/{uid}.
    try {
        const directDocument = await firestoreRequest(`users/${userId}`);
        const directWorkspace = parseWorkspaceDocument(directDocument);
        if (directWorkspace)
            return directWorkspace;
    }
    catch {
        // Compatibilité avec les versions précédentes.
    }
    const legacyDocument = await firestoreRequest(`users/${userId}/workspace/main`);
    return parseWorkspaceDocument(legacyDocument);
}
async function saveUserWorkspace(userId, workspace) {
    const body = JSON.stringify({
        fields: {
            workspaceJson: { stringValue: JSON.stringify(workspace) },
            updatedAt: { timestampValue: new Date().toISOString() },
        },
    });
    try {
        await firestoreRequest(`users/${userId}`, {
            method: 'PATCH',
            body,
        });
        return;
    }
    catch {
        // Si les anciennes règles n'autorisent que le chemin historique,
        // on conserve une solution de repli.
    }
    await firestoreRequest(`users/${userId}/workspace/main`, {
        method: 'PATCH',
        body,
    });
}
async function loadUserDismissedAlerts(userId) {
    const document = await firestoreRequest(`users/${userId}/settings/dismissed-alerts`);
    if (!document?.fields)
        return undefined;
    const jsonValue = document.fields.idsJson?.stringValue;
    if (jsonValue) {
        try {
            const parsed = JSON.parse(jsonValue);
            return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : undefined;
        }
        catch {
            return undefined;
        }
    }
    const ids = firestoreValueToJs(document.fields.ids);
    return Array.isArray(ids) ? ids.filter((item) => typeof item === 'string') : undefined;
}
async function saveUserDismissedAlerts(userId, ids) {
    await firestoreRequest(`users/${userId}/settings/dismissed-alerts`, {
        method: 'PATCH',
        body: JSON.stringify({
            fields: {
                idsJson: { stringValue: JSON.stringify(ids) },
                updatedAt: { timestampValue: new Date().toISOString() },
            },
        }),
    });
}

},
"src/lib/meetingPdf": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMeetingReportPdf = createMeetingReportPdf;
exports.downloadMeetingReportPdf = downloadMeetingReportPdf;
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const BOTTOM_LIMIT = PAGE_HEIGHT - 62;
const cp1252Extra = {
    '€': 0x80,
    '‚': 0x82,
    'ƒ': 0x83,
    '„': 0x84,
    '…': 0x85,
    '†': 0x86,
    '‡': 0x87,
    'ˆ': 0x88,
    '‰': 0x89,
    'Š': 0x8a,
    '‹': 0x8b,
    'Œ': 0x8c,
    'Ž': 0x8e,
    '‘': 0x91,
    '’': 0x92,
    '“': 0x93,
    '”': 0x94,
    '•': 0x95,
    '–': 0x96,
    '—': 0x97,
    '˜': 0x98,
    '™': 0x99,
    'š': 0x9a,
    '›': 0x9b,
    'œ': 0x9c,
    'ž': 0x9e,
    'Ÿ': 0x9f,
};
const toCp1252Byte = (character) => {
    const extra = cp1252Extra[character];
    if (extra !== undefined)
        return extra;
    const code = character.codePointAt(0) ?? 63;
    if (code >= 32 && code <= 255)
        return code;
    if (character === '\t')
        return 32;
    const simplified = character.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    const simplifiedCode = simplified.codePointAt(0);
    return simplifiedCode && simplifiedCode >= 32 && simplifiedCode <= 126 ? simplifiedCode : 63;
};
const pdfHex = (value) => `<${Array.from(value).map((character) => toCp1252Byte(character).toString(16).padStart(2, '0')).join('')}>`;
const number = (value) => Number(value.toFixed(2)).toString();
const estimateTextWidth = (value, fontSize, bold = false) => {
    const factor = bold ? 1.04 : 1;
    return Array.from(value).reduce((width, character) => {
        if (character === ' ')
            return width + fontSize * 0.28;
        if ("ilI.,'!:;|".includes(character))
            return width + fontSize * 0.25;
        if ('MW@%&'.includes(character))
            return width + fontSize * 0.82;
        if (/[A-ZÀÂÄÇÉÈÊËÎÏÔÖÙÛÜ]/.test(character))
            return width + fontSize * 0.62 * factor;
        if (/[0-9]/.test(character))
            return width + fontSize * 0.56 * factor;
        return width + fontSize * 0.5 * factor;
    }, 0);
};
const wrapLine = (value, maxWidth, fontSize, bold = false) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (!words.length)
        return [''];
    const lines = [];
    let current = '';
    const pushLongWord = (word) => {
        let chunk = '';
        for (const character of Array.from(word)) {
            const next = `${chunk}${character}`;
            if (chunk && estimateTextWidth(next, fontSize, bold) > maxWidth) {
                lines.push(chunk);
                chunk = character;
            }
            else {
                chunk = next;
            }
        }
        current = chunk;
    };
    for (const word of words) {
        const candidate = current ? `${current} ${word}` : word;
        if (estimateTextWidth(candidate, fontSize, bold) <= maxWidth) {
            current = candidate;
            continue;
        }
        if (current)
            lines.push(current);
        if (estimateTextWidth(word, fontSize, bold) > maxWidth) {
            current = '';
            pushLongWord(word);
        }
        else {
            current = word;
        }
    }
    if (current)
        lines.push(current);
    return lines;
};
const formatFrenchDate = (value) => {
    const parsed = new Date(`${value}T12:00:00`);
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
};
const meetingStatusLabel = (status) => ({
    planned: 'Prévue',
    done: 'Réalisée',
    cancelled: 'Annulée',
})[status];
const sanitizeFileName = (value) => value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
function createMeetingReportPdf({ project, meeting, stageLabel }) {
    const PAGE_WIDTH = 595.28;
    const PAGE_HEIGHT = 841.89;
    const MARGIN = 42;
    const BOTTOM_LIMIT = PAGE_HEIGHT - 58;
    const pages = [];
    let page = { commands: [] };
    pages.push(page);
    let top = 0;
    const addCommand = (command) => page.commands.push(command);
    const roundRectPath = (x, yTop, width, height, radius = 12) => {
        const y = PAGE_HEIGHT - yTop - height;
        const r = Math.max(0, Math.min(radius, width / 2, height / 2));
        const k = 0.5522847498;
        return [
            `${number(x + r)} ${number(y)} m`,
            `${number(x + width - r)} ${number(y)} l`,
            `${number(x + width - r + r * k)} ${number(y)} ${number(x + width)} ${number(y + r - r * k)} ${number(x + width)} ${number(y + r)} c`,
            `${number(x + width)} ${number(y + height - r)} l`,
            `${number(x + width)} ${number(y + height - r + r * k)} ${number(x + width - r + r * k)} ${number(y + height)} ${number(x + width - r)} ${number(y + height)} c`,
            `${number(x + r)} ${number(y + height)} l`,
            `${number(x + r - r * k)} ${number(y + height)} ${number(x)} ${number(y + height - r + r * k)} ${number(x)} ${number(y + height - r)} c`,
            `${number(x)} ${number(y + r)} l`,
            `${number(x)} ${number(y + r - r * k)} ${number(x + r - r * k)} ${number(y)} ${number(x + r)} ${number(y)} c`,
            'h',
        ].join(' ');
    };
    const fillRect = (x, yTop, width, height, rgb) => {
        addCommand(`${rgb.map(number).join(' ')} rg ${number(x)} ${number(PAGE_HEIGHT - yTop - height)} ${number(width)} ${number(height)} re f`);
    };
    const fillRoundRect = (x, yTop, width, height, rgb, radius = 12) => {
        addCommand(`${rgb.map(number).join(' ')} rg ${roundRectPath(x, yTop, width, height, radius)} f`);
    };
    const strokeRoundRect = (x, yTop, width, height, rgb, lineWidth = 1, radius = 12) => {
        addCommand(`${rgb.map(number).join(' ')} RG ${number(lineWidth)} w ${roundRectPath(x, yTop, width, height, radius)} S`);
    };
    const strokeLine = (x1, y1Top, x2, y2Top, rgb, lineWidth = 1) => {
        addCommand(`${rgb.map(number).join(' ')} RG ${number(lineWidth)} w ${number(x1)} ${number(PAGE_HEIGHT - y1Top)} m ${number(x2)} ${number(PAGE_HEIGHT - y2Top)} l S`);
    };
    const drawText = (value, x, yTop, fontSize, bold = false, rgb = [0.14, 0.16, 0.19]) => {
        addCommand(`BT /${bold ? 'F2' : 'F1'} ${number(fontSize)} Tf ${rgb.map(number).join(' ')} rg 1 0 0 1 ${number(x)} ${number(PAGE_HEIGHT - yTop - fontSize)} Tm ${pdfHex(value)} Tj ET`);
    };
    const drawRightText = (value, rightX, yTop, fontSize, bold = false, rgb = [0.14, 0.16, 0.19]) => {
        drawText(value, rightX - estimateTextWidth(value, fontSize, bold), yTop, fontSize, bold, rgb);
    };
    const drawCenteredText = (value, centerX, yTop, fontSize, bold = false, rgb = [0.14, 0.16, 0.19]) => {
        drawText(value, centerX - estimateTextWidth(value, fontSize, bold) / 2, yTop, fontSize, bold, rgb);
    };
    const getFieldMeta = (value, width, fontSize = 10.4, bold = true, minHeight = 58, maxLines = 3) => {
        const content = value && value.trim() ? value.trim() : '-';
        const lines = wrapLine(content, width - 34, fontSize, bold).slice(0, maxLines);
        return { lines, height: Math.max(minHeight, 30 + lines.length * 13 + 9) };
    };
    const drawFieldCard = (label, value, x, y, width, height, fontSize = 10.4, bold = true) => {
        const meta = getFieldMeta(value, width, fontSize, bold, height);
        fillRoundRect(x, y, width, height, [0.982, 0.985, 0.989], 6);
        strokeRoundRect(x, y, width, height, [0.89, 0.91, 0.94], 0.8, 6);
        fillRoundRect(x + 11, y + 11, 4, height - 22, [0.78, 0.05, 0.13], 1);
        drawText(label.toUpperCase(), x + 25, y + 11, 7.1, true, [0.46, 0.49, 0.54]);
        meta.lines.forEach((line, index) => {
            drawText(line, x + 25, y + 28 + index * 13, fontSize, bold, [0.13, 0.15, 0.18]);
        });
    };
    const drawSectionTitle = (title, y) => {
        fillRoundRect(MARGIN, y, 6, 24, [0.78, 0.05, 0.13], 1);
        drawText(title, MARGIN + 16, y + 2, 13.2, true, [0.12, 0.14, 0.17]);
    };
    const drawHeader = (continuation = false) => {
        fillRect(0, 0, PAGE_WIDTH, 9, [0.78, 0.05, 0.13]);
        drawText('MAISONS ARLOGIS', MARGIN, 24, 8.4, true, [0.45, 0.48, 0.52]);
        drawText(continuation ? 'Compte rendu de réunion - suite' : 'Compte rendu de réunion de chantier', MARGIN, 39, continuation ? 14.5 : 18.5, true, [0.11, 0.13, 0.16]);
        drawText([meetingStatusLabel(meeting.status), meeting.type].filter(Boolean).join(' • '), MARGIN, 59, 9, false, [0.48, 0.51, 0.56]);
        const dateWidth = 142;
        const dateX = PAGE_WIDTH - MARGIN - dateWidth;
        fillRoundRect(dateX, 18, dateWidth, 54, [0.995, 0.963, 0.968], 8);
        strokeRoundRect(dateX, 18, dateWidth, 54, [0.95, 0.84, 0.87], 0.8, 8);
        drawText('DATE', dateX + 14, 29, 7.2, true, [0.58, 0.25, 0.31]);
        drawRightText(formatFrenchDate(meeting.meetingDate), dateX + dateWidth - 14, 46, 10.3, true, [0.15, 0.17, 0.2]);
        strokeLine(MARGIN, 83, PAGE_WIDTH - MARGIN, 83, [0.88, 0.9, 0.93], 0.8);
    };
    const newPage = (continuation = false) => {
        page = { commands: [] };
        pages.push(page);
        drawHeader(continuation);
        top = 104;
        if (continuation) {
            drawSectionTitle('Suite des observations', top);
            top += 38;
        }
    };
    const ensureSpace = (height) => {
        if (top + height <= BOTTOM_LIMIT)
            return;
        newPage(true);
    };
    const projectRef = [project.projectNumber, project.contractNumber].filter(Boolean).join(' / ');
    const chantierLabel = [project.name, project.city].filter(Boolean).join(' - ');
    const clientContact = [project.clientName, project.clientPhone || project.clientPhoneSecondary, project.clientEmail || project.clientEmailSecondary]
        .filter(Boolean)
        .join(' • ');
    const siteAddress = [project.address, [project.postalCode, project.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
    drawHeader(false);
    top = 104;
    drawSectionTitle('Informations du chantier', top);
    top += 34;
    const outerWidth = PAGE_WIDTH - MARGIN * 2;
    const infoY = top;
    const innerPadding = 14;
    const gap = 12;
    const clientWidth = outerWidth - innerPadding * 2;
    const colWidth = (clientWidth - gap) / 2;
    const clientMeta = getFieldMeta(clientContact || project.clientName || '-', clientWidth, 10.2, true, 60, 3);
    const chantierMeta = getFieldMeta(chantierLabel || project.name || '-', colWidth, 10.3, true, 60, 3);
    const referenceMeta = getFieldMeta(projectRef || '-', colWidth, 10.3, true, 60, 3);
    const addressMeta = getFieldMeta(siteAddress || project.city || '-', clientWidth, 10.1, false, 56, 3);
    const rowTwoHeight = Math.max(chantierMeta.height, referenceMeta.height);
    const infoHeight = innerPadding + clientMeta.height + gap + rowTwoHeight + gap + addressMeta.height + innerPadding;
    fillRoundRect(MARGIN, infoY, outerWidth, infoHeight, [1, 1, 1], 8);
    strokeRoundRect(MARGIN, infoY, outerWidth, infoHeight, [0.88, 0.9, 0.93], 0.9, 8);
    const innerX = MARGIN + innerPadding;
    let innerTop = infoY + innerPadding;
    drawFieldCard('Client', clientContact || project.clientName || '-', innerX, innerTop, clientWidth, clientMeta.height, 10.2, true);
    innerTop += clientMeta.height + gap;
    drawFieldCard('Chantier', chantierLabel || project.name || '-', innerX, innerTop, colWidth, rowTwoHeight, 10.3, true);
    drawFieldCard('Référence', projectRef || '-', innerX + colWidth + gap, innerTop, colWidth, rowTwoHeight, 10.3, true);
    innerTop += rowTwoHeight + gap;
    drawFieldCard('Adresse du chantier', siteAddress || project.city || '-', innerX, innerTop, clientWidth, addressMeta.height, 10.1, false);
    top = infoY + infoHeight + 18;
    fillRect(MARGIN, top, outerWidth, 60, [0.15, 0.17, 0.2]);
    fillRect(MARGIN + 14, top + 15, 104, 30, [0.78, 0.05, 0.13]);
    drawCenteredText('ÉTAPE DU CHANTIER', MARGIN + 66, top + 22, 7.8, true, [1, 1, 1]);
    const stageLines = wrapLine(stageLabel || 'Non renseignée', outerWidth - 150, 13.4, true).slice(0, 2);
    stageLines.forEach((line, index) => {
        drawText(line, MARGIN + 136, top + 18 + index * 15, 13.4, true, [1, 1, 1]);
    });
    top += 82;
    drawSectionTitle('Observations et décisions', top);
    top += 38;
    const rawNotes = (meeting.notes || '').trim();
    const noteBlocks = rawNotes
        ? rawNotes
            .replace(/\r/g, '')
            .split(/\n{2,}/)
            .flatMap((block) => block.split('\n').map((line) => line.trim()).filter(Boolean))
        : ['Aucune remarque particulière n’a été renseignée pour cette réunion.'];
    for (const rawBlock of noteBlocks) {
        const content = rawBlock.replace(/^[-*•]\s+/, '');
        let lines = wrapLine(content, outerWidth - 30, 10.5, false);
        while (lines.length) {
            ensureSpace(30);
            const availableLines = Math.max(1, Math.floor((BOTTOM_LIMIT - top - 6) / 16));
            const chunk = lines.slice(0, availableLines);
            lines = lines.slice(chunk.length);
            fillRoundRect(MARGIN + 3, top + 5, 8, 8, [0.78, 0.05, 0.13], 4);
            chunk.forEach((line, index) => {
                drawText(line, MARGIN + 24, top + index * 16, 10.5, false, [0.18, 0.2, 0.23]);
            });
            top += chunk.length * 16 + 12;
        }
    }
    pages.forEach((pdfPage, index) => {
        const previousPage = page;
        page = pdfPage;
        strokeLine(MARGIN, PAGE_HEIGHT - 39, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 39, [0.88, 0.9, 0.93], 0.7);
        drawText(`Conduct'Home - ${project.name}`, MARGIN, PAGE_HEIGHT - 28, 7.6, false, [0.49, 0.52, 0.57]);
        drawRightText(`Page ${index + 1}/${pages.length}`, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 28, 7.6, true, [0.49, 0.52, 0.57]);
        page = previousPage;
    });
    const objectCount = 4 + pages.length * 2;
    const objects = new Array(objectCount + 1).fill('');
    objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
    const pageObjectNumbers = pages.map((_, index) => 5 + index * 2);
    objects[2] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((value) => `${value} 0 R`).join(' ')}] /Count ${pages.length} >>`;
    objects[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
    objects[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
    pages.forEach((pdfPage, index) => {
        const pageObjectNumber = 5 + index * 2;
        const contentObjectNumber = pageObjectNumber + 1;
        const stream = pdfPage.commands.join('\n');
        const streamLength = new TextEncoder().encode(stream).length;
        objects[pageObjectNumber] =
            `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${number(PAGE_WIDTH)} ${number(PAGE_HEIGHT)}] ` +
                `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`;
        objects[contentObjectNumber] = `<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`;
    });
    const encoder = new TextEncoder();
    let pdf = '%PDF-1.4\n';
    const offsets = [0];
    for (let index = 1; index < objects.length; index++) {
        offsets[index] = encoder.encode(pdf).length;
        pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
    }
    const xrefOffset = encoder.encode(pdf).length;
    pdf += `xref\n0 ${objects.length}\n`;
    pdf += '0000000000 65535 f \n';
    for (let index = 1; index < objects.length; index++) {
        pdf += `${offsets[index].toString().padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
}
function downloadMeetingReportPdf(input) {
    const blob = createMeetingReportPdf(input);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Compte-rendu-${sanitizeFileName(input.project.name)}-${input.meeting.meetingDate}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

},
"src/lib/outlookDraft": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createOutlookDraft = createOutlookDraft;
const blobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error ?? new Error('Lecture du fichier impossible.'));
    reader.readAsDataURL(blob);
});
const sanitizeHeader = (value) => value.replace(/[\r\n]+/g, ' ').trim();
const encodeBlobPart = async ({ blob, name, mimeType }) => {
    const encoded = await blobToBase64(blob);
    const lines = encoded.match(/.{1,76}/g)?.join('\r\n') ?? '';
    return {
        lines,
        safeName: name.replaceAll('"', ''),
        contentType: mimeType || blob.type || 'application/octet-stream',
    };
};
async function createOutlookDraft({ to, subject, body, htmlBody, inlineImages = [], attachments = [], fileName, }) {
    const stamp = Date.now();
    const mixedBoundary = `----ConductHomeMixed-${stamp}`;
    const relatedBoundary = `----ConductHomeRelated-${stamp}`;
    const alternativeBoundary = `----ConductHomeAlternative-${stamp}`;
    const hasRichBody = Boolean(htmlBody || inlineImages.length);
    let content = [
        'X-Unsent: 1',
        `To: ${sanitizeHeader(to)}`,
        `Subject: ${sanitizeHeader(subject)}`,
        'MIME-Version: 1.0',
        `Content-Type: multipart/mixed; boundary="${mixedBoundary}"`,
        '',
        '',
    ].join('\r\n');
    if (hasRichBody) {
        content += [
            `--${mixedBoundary}`,
            `Content-Type: multipart/related; boundary="${relatedBoundary}"`,
            '',
            `--${relatedBoundary}`,
            `Content-Type: multipart/alternative; boundary="${alternativeBoundary}"`,
            '',
            `--${alternativeBoundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 8bit',
            '',
            body,
            '',
            `--${alternativeBoundary}`,
            'Content-Type: text/html; charset="UTF-8"',
            'Content-Transfer-Encoding: 8bit',
            '',
            htmlBody || body,
            '',
            `--${alternativeBoundary}--`,
            '',
        ].join('\r\n');
        for (const image of inlineImages) {
            const encoded = await encodeBlobPart(image);
            content += [
                `--${relatedBoundary}`,
                `Content-Type: ${encoded.contentType}; name="${encoded.safeName}"`,
                `Content-ID: <${sanitizeHeader(image.contentId)}>`,
                `Content-Disposition: inline; filename="${encoded.safeName}"`,
                'Content-Transfer-Encoding: base64',
                '',
                encoded.lines,
                '',
            ].join('\r\n');
        }
        content += `--${relatedBoundary}--\r\n`;
    }
    else {
        content += [
            `--${mixedBoundary}`,
            'Content-Type: text/plain; charset="UTF-8"',
            'Content-Transfer-Encoding: 8bit',
            '',
            body,
            '',
        ].join('\r\n');
    }
    for (const attachment of attachments) {
        const encoded = await encodeBlobPart(attachment);
        content += [
            `--${mixedBoundary}`,
            `Content-Type: ${encoded.contentType}; name="${encoded.safeName}"`,
            `Content-Disposition: attachment; filename="${encoded.safeName}"`,
            'Content-Transfer-Encoding: base64',
            '',
            encoded.lines,
            '',
        ].join('\r\n');
    }
    content += `--${mixedBoundary}--\r\n`;
    const eml = new Blob([content], { type: 'message/rfc822' });
    const url = URL.createObjectURL(eml);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || `${subject.replace(/[\\/:*?"<>|]/g, '-').trim() || 'Brouillon Outlook'}.eml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

},
"src/lib/planning": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStageLabel = exports.getNextStage = exports.getCurrentStage = exports.getProgress = exports.isProjectLate = exports.isStageLate = exports.getStageScheduleState = exports.formatShortDate = exports.formatDate = void 0;
exports.buildNotifications = buildNotifications;
const stages_1 = require("../data/stages");
const parseAppDate = (value) => new Date(value.includes('T') ? value : `${value}T12:00:00`);
const formatDate = (value) => {
    if (!value)
        return '—';
    const date = parseAppDate(value);
    if (Number.isNaN(date.getTime()))
        return '—';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
};
exports.formatDate = formatDate;
const formatShortDate = (value) => {
    if (!value)
        return '—';
    const date = parseAppDate(value);
    if (Number.isNaN(date.getTime()))
        return '—';
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(date);
};
exports.formatShortDate = formatShortDate;
const dayDiff = (actual, planned) => {
    const actualDate = parseAppDate(actual);
    const plannedDate = parseAppDate(planned);
    if (Number.isNaN(actualDate.getTime()) || Number.isNaN(plannedDate.getTime()))
        return 0;
    actualDate.setHours(12, 0, 0, 0);
    plannedDate.setHours(12, 0, 0, 0);
    return Math.round((actualDate.getTime() - plannedDate.getTime()) / 86400000);
};
const getStageScheduleState = (stage) => {
    if (!stage.plannedDate)
        return undefined;
    if (stage.actualInterventionDate) {
        const deltaDays = dayDiff(stage.actualInterventionDate, stage.plannedDate);
        if (deltaDays > 0)
            return {
                status: 'late',
                deltaDays,
                hasActualDate: true,
                label: `Retard +${deltaDays} j`,
            };
        if (deltaDays < 0)
            return {
                status: 'ahead',
                deltaDays,
                hasActualDate: true,
                label: `Avance ${Math.abs(deltaDays)} j`,
            };
        return {
            status: 'on_time',
            deltaDays: 0,
            hasActualDate: true,
            label: 'À l’heure',
        };
    }
    if (stage.status !== 'done') {
        const today = new Date();
        today.setHours(12, 0, 0, 0);
        const plannedDate = parseAppDate(stage.plannedDate);
        plannedDate.setHours(12, 0, 0, 0);
        if (plannedDate.getTime() < today.getTime()) {
            const deltaDays = Math.round((today.getTime() - plannedDate.getTime()) / 86400000);
            return {
                status: 'late',
                deltaDays,
                hasActualDate: false,
                label: `Retard +${deltaDays} j`,
            };
        }
    }
    return undefined;
};
exports.getStageScheduleState = getStageScheduleState;
const isStageLate = (stage) => (0, exports.getStageScheduleState)(stage)?.status === 'late';
exports.isStageLate = isStageLate;
const isProjectLate = (project) => project.stages.some(exports.isStageLate);
exports.isProjectLate = isProjectLate;
const getProgress = (project) => {
    if (!project.stages.length)
        return 0;
    const done = project.stages.filter((stage) => stage.status === 'done').length;
    return Math.round((done / project.stages.length) * 100);
};
exports.getProgress = getProgress;
const getCurrentStage = (project) => project.stages.find((stage) => stage.status === 'in_progress' || stage.status === 'blocked')
    ?? project.stages.find((stage) => stage.status === 'scheduled' || stage.status === 'todo');
exports.getCurrentStage = getCurrentStage;
const getNextStage = (project) => {
    const current = (0, exports.getCurrentStage)(project);
    const currentIndex = current
        ? project.stages.findIndex((stage) => stage.stageId === current.stageId)
        : -1;
    if (currentIndex >= 0) {
        return project.stages.slice(currentIndex + 1).find((stage) => stage.status !== 'done');
    }
    return project.stages.find((stage) => stage.status !== 'done');
};
exports.getNextStage = getNextStage;
const getStageLabel = (stageId) => stages_1.STAGES.find((stage) => stage.id === stageId)?.label ?? 'Non définie';
exports.getStageLabel = getStageLabel;
function buildNotifications(projects, artisans) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const notifications = [];
    for (const project of projects) {
        for (const stage of project.stages) {
            if (!stage.plannedDate || stage.status === 'done')
                continue;
            const planned = new Date(`${stage.plannedDate}T00:00:00`);
            const days = Math.ceil((planned.getTime() - today.getTime()) / 86400000);
            const artisan = artisans.find((item) => item.id === stage.artisanId);
            const artisanName = stage.artisanName?.trim() || artisan?.company;
            const notifyBefore = stage.notifyBeforeDays ?? artisan?.leadTimeDays ?? 7;
            if (days > notifyBefore || days < -10)
                continue;
            const severity = days < 0 ? 'urgent' : days <= 2 ? 'warning' : 'info';
            const title = days < 0
                ? `${(0, exports.getStageLabel)(stage.stageId)} en retard de ${Math.abs(days)} j`
                : `Prévenir ${artisanName || 'l’artisan'} pour ${(0, exports.getStageLabel)(stage.stageId)}`;
            notifications.push({
                id: `${project.id}-${stage.stageId}-${stage.plannedDate}`,
                projectId: project.id,
                projectName: project.name,
                stageId: stage.stageId,
                title,
                dueDate: stage.plannedDate,
                severity,
                ...(artisanName ? { artisanName } : {}),
            });
        }
    }
    return notifications.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

},
"src/lib/projectSharing": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectShareLink = createProjectShareLink;
exports.readSharedProjectFromLocation = readSharedProjectFromLocation;
exports.clearSharedProjectHash = clearSharedProjectHash;
const SHARE_HASH_PREFIX = '#conducthome-share=';
const toBase64Url = (value) => {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    for (let index = 0; index < bytes.length; index += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(index, index + 0x8000));
    }
    return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
};
const fromBase64Url = (value) => {
    const normalized = value.replaceAll('-', '+').replaceAll('_', '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
};
function createProjectShareLink(project, sharedBy) {
    const payload = {
        version: 1,
        sharedAt: new Date().toISOString(),
        sharedBy: sharedBy?.trim() || undefined,
        project,
    };
    const encoded = toBase64Url(JSON.stringify(payload));
    return `${window.location.origin}${window.location.pathname}${SHARE_HASH_PREFIX}${encoded}`;
}
function readSharedProjectFromLocation() {
    if (!window.location.hash.startsWith(SHARE_HASH_PREFIX))
        return undefined;
    try {
        const payload = JSON.parse(fromBase64Url(window.location.hash.slice(SHARE_HASH_PREFIX.length)));
        if (payload?.version !== 1 || !payload.project?.id || !payload.project?.name || !Array.isArray(payload.project.stages)) {
            return undefined;
        }
        return payload;
    }
    catch {
        return undefined;
    }
}
function clearSharedProjectHash() {
    const cleanUrl = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState({}, document.title, cleanUrl);
}

},
"src/lib/repository": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWorkspaceNow = syncWorkspaceNow;
exports.loadAppData = loadAppData;
exports.saveProject = saveProject;
exports.removeProject = removeProject;
exports.saveLot = saveLot;
exports.removeLot = removeLot;
exports.saveArtisan = saveArtisan;
exports.removeArtisan = removeArtisan;
exports.saveTask = saveTask;
exports.removeTask = removeTask;
exports.saveCalendarEvent = saveCalendarEvent;
exports.removeCalendarEvent = removeCalendarEvent;
exports.uploadDocument = uploadDocument;
exports.moveDocumentCategory = moveDocumentCategory;
exports.removeDocument = removeDocument;
exports.getLocalDocumentBlob = getLocalDocumentBlob;
exports.saveArtisanConvention = saveArtisanConvention;
exports.getArtisanConventionBlob = getArtisanConventionBlob;
exports.getDocumentUrl = getDocumentUrl;
exports.loadDismissedNotificationIds = loadDismissedNotificationIds;
exports.dismissNotification = dismissNotification;
exports.resetDemoData = resetDemoData;
const mockData_1 = require("../data/mockData");
const lots_1 = require("../data/lots");
const stages_1 = require("../data/stages");
const artisans_1 = require("./artisans");
const auth_1 = require("./auth");
const firebase_1 = require("./firebase");
// Les clés restent identiques à la version vierge précédente afin de conserver
// les données déjà saisies dans ce navigateur après la mise à jour.
const STORAGE_KEY = 'conduct-home-workspace-v1.2-clean';
const DISMISSED_ALERTS_KEY = 'conduct-home-dismissed-alerts-v1.2-clean';
const FILE_DB_NAME = 'conduct-home-files-v1.2-clean';
const FILE_STORE_NAME = 'files';
const SCHEMA_VERSION = 16;
const scopedKey = (baseKey) => {
    const accountKey = (0, auth_1.getCurrentAccountKey)();
    return accountKey ? `${baseKey}::${accountKey}` : baseKey;
};
const getStorageKey = () => scopedKey(STORAGE_KEY);
const getDismissedAlertsKey = () => scopedKey(DISMISSED_ALERTS_KEY);
const legacyEmailAccountKey = () => {
    const email = (0, auth_1.getCurrentUser)()?.email;
    return email ? email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : undefined;
};
async function loadRemoteWorkspace() {
    const accountKey = (0, auth_1.getCurrentAccountKey)();
    if (!accountKey)
        return undefined;
    const workspace = await (0, firebase_1.loadUserWorkspace)(accountKey);
    if (!workspace)
        return undefined;
    return migrateState(workspace);
}
async function saveRemoteWorkspace(state) {
    const accountKey = (0, auth_1.getCurrentAccountKey)();
    if (!accountKey)
        return;
    await (0, firebase_1.saveUserWorkspace)(accountKey, { ...state, schemaVersion: SCHEMA_VERSION });
}
function loadLegacyAccountLocal() {
    const legacyKey = legacyEmailAccountKey();
    if (!legacyKey)
        return undefined;
    const raw = localStorage.getItem(`${STORAGE_KEY}::${legacyKey}`);
    if (!raw)
        return undefined;
    try {
        return migrateState(JSON.parse(raw));
    }
    catch {
        return undefined;
    }
}
const DEMO_ARTISAN_IDS = new Set(['a-macon', 'a-charp', 'a-menuisier', 'a-plaquiste', 'a-electricien']);
const cloneSeed = () => JSON.parse(JSON.stringify({
    schemaVersion: SCHEMA_VERSION,
    projects: mockData_1.PROJECTS,
    lots: (0, lots_1.cloneDefaultLots)(),
    artisans: mockData_1.ARTISANS,
    documents: mockData_1.DOCUMENTS,
    tasks: [],
    calendarEvents: [],
}));
const OLD_STAGE_CANDIDATES = {
    opening: ['opening'],
    foundations: ['foundations'],
    vs_basement: ['crawlspace'],
    tubing: [],
    floor_slab_pour: [],
    elevations: ['elevation'],
    frame_delivery: [],
    frame: ['frame'],
    roof: ['roof'],
    zinc: ['gutters'],
    thresholds: [],
    pre_backfill: ['earthworks'],
    ext_joinery_delivery: [],
    ext_joinery: ['exterior_joinery', 'garage_door'],
    drywall_delivery: [],
    drywall_first: ['drywall'],
    electrical_first: ['electric_rough'],
    plumbing_first: ['plumbing_rough'],
    drywall_second: [],
    joints: [],
    electrical_second: [],
    plumbing_second: [],
    underfloor_heating: ['underfloor'],
    liquid_screed: ['screed'],
    attic_insulation: ['insulation'],
    sanitary_delivery: [],
    sanitary: ['sanitary'],
    tile_delivery: [],
    tile_installation: ['tiles'],
    painting: ['painting'],
    stairs: ['stairs'],
    render: ['render'],
    heating: ['heat_pump'],
    final_earthworks: [],
    permeability_test: ['airtightness'],
};
const LEGACY_LOT_ALIASES = {
    'lot-earthworks': ['terrassement', 'terrassier', 'tp', 'travaux publics'],
    'lot-structural': ['gros oeuvre', 'maconnerie', 'maçonnerie', 'macon'],
    'lot-frame': ['charpente', 'charpentier'],
    'lot-roof': ['couverture', 'couvreur'],
    'lot-zinc': ['zinguerie', 'gouttieres', 'gouttières'],
    'lot-exterior-joinery': ['menuiseries exterieures', 'menuiserie exterieure', 'mext'],
    'lot-interior-joinery': ['menuiseries interieures', 'menuiserie interieure', 'mint'],
    'lot-render': ['enduit', 'facade', 'façade'],
    'lot-plastering': ['platrerie', 'plâtrerie', 'placo', 'plaquiste'],
    'lot-electricity': ['electricite', 'électricité', 'electricien'],
    'lot-plumbing': ['plomberie', 'plombier'],
    'lot-heating': ['chauffage', 'chauffagiste', 'pompe a chaleur', 'pac'],
    'lot-insulation': ['isolant', 'isolation'],
    'lot-liquid-screed': ['chape', 'chappe', 'chape liquide', 'chappe liquide'],
    'lot-attic-insulation': ['isolation', 'isolation combles'],
    'lot-tiling': ['carrelage', 'faience', 'faïence', 'carreleur'],
    'lot-stairs': ['escalier'],
    'lot-sanitary': ['sanitaires', 'sanitaire'],
    'lot-painting': ['peinture', 'peintures', 'peintre'],
    'lot-soft-flooring': ['sols souples', 'solier', 'revetements de sol', 'revêtements de sol'],
    'lot-permeability': ['test permea', 'teste permea', 'permeabilite', 'perméabilité'],
    'lot-cleaning': ['nettoyage', 'nettoyage chantier'],
};
function migrateProjectRecord(project) {
    const existingStages = Array.isArray(project.stages) ? project.stages : [];
    const byId = new Map(existingStages.map((stage) => [stage.stageId, stage]));
    const used = new Set();
    const stages = stages_1.STAGES.map((definition) => {
        const candidateIds = [definition.id, ...(OLD_STAGE_CANDIDATES[definition.id] ?? [])];
        const sourceId = candidateIds.find((id) => byId.has(id) && !used.has(id));
        if (!sourceId)
            return { stageId: definition.id, status: 'todo' };
        used.add(sourceId);
        const source = byId.get(sourceId);
        return { ...source, stageId: definition.id };
    });
    return {
        ...project,
        id: String(project.id ?? crypto.randomUUID()),
        name: String(project.name ?? ''),
        city: String(project.city ?? ''),
        postalCode: project.postalCode == null ? undefined : String(project.postalCode),
        clientName: String(project.clientName ?? project.name ?? ''),
        clientEmail: project.clientEmail == null ? undefined : String(project.clientEmail),
        startDate: String(project.startDate ?? new Date().toISOString().slice(0, 10)),
        targetEndDate: String(project.targetEndDate ?? new Date().toISOString().slice(0, 10)),
        status: project.status ?? 'on_track',
        stages,
    };
}
function legacySelectedNames(artisan, legacyLots) {
    const ids = new Set([
        ...(Array.isArray(artisan.lotIds) ? artisan.lotIds : []),
        ...(artisan.lotId ? [artisan.lotId] : []),
    ]);
    const names = legacyLots.filter((lot) => ids.has(lot.id)).map((lot) => lot.name);
    if (names.length > 0)
        return names;
    return (artisan.trade ?? '').split(/[,;/|]+/).map((value) => value.trim()).filter(Boolean);
}
function inferLegacyStageIds(artisan, legacyLots) {
    const direct = (0, artisans_1.getArtisanStageIds)(artisan, legacyLots);
    if (direct.length > 0)
        return direct;
    const names = legacySelectedNames(artisan, legacyLots).map(artisans_1.normalizeTradeName);
    const matchedLots = lots_1.DEFAULT_LOTS.filter((lot) => {
        const aliases = [lot.name, lot.code ?? '', ...(LEGACY_LOT_ALIASES[lot.id] ?? [])]
            .map(artisans_1.normalizeTradeName)
            .filter(Boolean);
        return names.some((name) => aliases.some((alias) => name === alias || (name.length >= 4 && alias.includes(name)) || (alias.length >= 4 && name.includes(alias))));
    });
    return Array.from(new Set(matchedLots.flatMap((lot) => lot.stageIds ?? [])));
}
function migrateArtisanRecord(artisan, legacyLots, currentLots) {
    const stageIds = inferLegacyStageIds(artisan, legacyLots).filter((id) => stages_1.STAGE_IDS.has(id));
    const primaryLotId = (0, artisans_1.getArtisanPrimaryLotId)({ ...artisan, stageIds }, currentLots);
    const primaryLot = currentLots.find((lot) => lot.id === primaryLotId);
    return {
        ...artisan,
        lotId: primaryLotId,
        lotIds: primaryLotId ? [primaryLotId] : [],
        stageIds: Array.from(new Set(stageIds)),
        trade: primaryLot?.name ?? artisan.trade ?? '',
    };
}
function migrateKnownLotStages(lots) {
    const byId = new Map(lots.map((lot) => [lot.id, lot]));
    const merged = lots_1.DEFAULT_LOTS.map((defaultLot) => {
        const existing = byId.get(defaultLot.id);
        if (!existing)
            return { ...defaultLot, stageIds: [...(defaultLot.stageIds ?? [])] };
        return {
            ...existing,
            stageIds: Array.from(new Set([...(existing.stageIds ?? []), ...(defaultLot.stageIds ?? [])])),
        };
    });
    const customLots = lots.filter((lot) => !lots_1.DEFAULT_LOTS.some((defaultLot) => defaultLot.id === lot.id));
    return [...merged, ...customLots];
}
function migrateCalendarEvent(event) {
    if (!event?.id || !event.date || !event.startTime || !event.note)
        return undefined;
    const startMinutes = Number(event.startTime.slice(0, 2)) * 60 + Number(event.startTime.slice(3, 5));
    const fallbackEndMinutes = Number.isFinite(startMinutes) ? Math.min(20 * 60, startMinutes + 60) : 8 * 60;
    const fallbackEnd = `${String(Math.floor(fallbackEndMinutes / 60)).padStart(2, '0')}:${String(fallbackEndMinutes % 60).padStart(2, '0')}`;
    const timestamp = new Date().toISOString();
    return {
        id: String(event.id),
        projectId: event.projectId ? String(event.projectId) : undefined,
        date: String(event.date),
        startTime: String(event.startTime),
        endTime: event.endTime ? String(event.endTime) : fallbackEnd,
        note: String(event.note),
        createdAt: event.createdAt ? String(event.createdAt) : timestamp,
        updatedAt: event.updatedAt ? String(event.updatedAt) : timestamp,
    };
}
function migrateAutomaticMeetingTask(task, projects) {
    for (const stageId of stages_1.MEETING_REMINDER_STAGE_IDS) {
        const prefix = `task-rdv-client-${stageId}-`;
        if (!task.id.startsWith(prefix))
            continue;
        const projectId = task.id.slice(prefix.length);
        const project = projects.find((item) => item.id === projectId);
        const stage = stages_1.STAGES.find((item) => item.id === stageId);
        if (!project || !stage)
            return task;
        return {
            ...task,
            title: `Prendre rendez-vous avec ${project.clientName}`,
            details: `L’étape « ${stage.label} » du chantier ${project.name} est terminée. Organiser une réunion sur chantier avec ${project.clientName}.`,
        };
    }
    return task;
}
function migrateState(value) {
    const sourceVersion = Number(value.schemaVersion ?? 0);
    const legacyLots = Array.isArray(value.lots) ? value.lots.filter(Boolean) : [];
    const lotSource = legacyLots.length > 0 || sourceVersion >= 7 ? legacyLots : (0, lots_1.cloneDefaultLots)();
    const lots = (0, lots_1.normalizeLotOrders)(migrateKnownLotStages(lotSource));
    const artisans = (Array.isArray(value.artisans) ? value.artisans : [])
        .filter((artisan) => artisan && !DEMO_ARTISAN_IDS.has(artisan.id))
        .map((artisan) => migrateArtisanRecord(artisan, legacyLots, lots));
    const projects = (Array.isArray(value.projects) ? value.projects : []).map(migrateProjectRecord);
    const tasks = (Array.isArray(value.tasks) ? value.tasks : []).map((task) => migrateAutomaticMeetingTask(task, projects));
    return {
        schemaVersion: SCHEMA_VERSION,
        workspaceUpdatedAt: typeof value.workspaceUpdatedAt === 'string' ? value.workspaceUpdatedAt : undefined,
        projects,
        lots,
        artisans,
        documents: (Array.isArray(value.documents) ? value.documents : []).filter((document) => Boolean(document?.id && document?.projectId && document?.name)),
        tasks,
        calendarEvents: (Array.isArray(value.calendarEvents) ? value.calendarEvents : [])
            .map((event) => migrateCalendarEvent(event))
            .filter((event) => Boolean(event)),
    };
}
function loadCachedLocal() {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw)
        return undefined;
    try {
        const migrated = migrateState(JSON.parse(raw));
        localStorage.setItem(getStorageKey(), JSON.stringify(migrated));
        return migrated;
    }
    catch {
        return undefined;
    }
}
function dispatchRemoteSync(data) {
    window.dispatchEvent(new CustomEvent('conduct-home-remote-sync', { detail: data }));
}
function loadLocal() {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw) {
        const seed = cloneSeed();
        localStorage.setItem(getStorageKey(), JSON.stringify(seed));
        return seed;
    }
    try {
        const migrated = migrateState(JSON.parse(raw));
        localStorage.setItem(getStorageKey(), JSON.stringify(migrated));
        return migrated;
    }
    catch {
        const seed = cloneSeed();
        localStorage.setItem(getStorageKey(), JSON.stringify(seed));
        return seed;
    }
}
function loadExistingLocal() {
    const raw = localStorage.getItem(getStorageKey());
    if (!raw)
        return undefined;
    try {
        const migrated = migrateState(JSON.parse(raw));
        localStorage.setItem(getStorageKey(), JSON.stringify(migrated));
        return migrated;
    }
    catch {
        return undefined;
    }
}
function withTimeout(promise, delayMs) {
    return new Promise((resolve) => {
        let resolved = false;
        const timer = window.setTimeout(() => {
            if (resolved)
                return;
            resolved = true;
            resolve(undefined);
        }, delayMs);
        promise
            .then((value) => {
            if (resolved)
                return;
            resolved = true;
            window.clearTimeout(timer);
            resolve(value);
        })
            .catch(() => {
            if (resolved)
                return;
            resolved = true;
            window.clearTimeout(timer);
            resolve(undefined);
        });
    });
}
const PENDING_SYNC_KEY = 'conduct-home-pending-cloud-sync-v1.50';
let queuedRemoteState;
let remoteSyncTimer;
let remoteSyncInFlight = false;
const getPendingSyncKey = () => scopedKey(PENDING_SYNC_KEY);
function dispatchCloudSyncStatus(status, message) {
    window.dispatchEvent(new CustomEvent('conduct-home-cloud-sync-status', {
        detail: { status, message },
    }));
}
async function flushQueuedRemoteState() {
    if (remoteSyncInFlight || !queuedRemoteState)
        return;
    remoteSyncInFlight = true;
    const stateToSave = queuedRemoteState;
    dispatchCloudSyncStatus('syncing');
    try {
        await saveRemoteWorkspace(stateToSave);
        if (queuedRemoteState === stateToSave)
            queuedRemoteState = undefined;
        localStorage.removeItem(getPendingSyncKey());
        dispatchCloudSyncStatus('synced');
    }
    catch (reason) {
        localStorage.setItem(getPendingSyncKey(), JSON.stringify(stateToSave));
        dispatchCloudSyncStatus('pending', reason instanceof Error ? reason.message : 'Synchronisation cloud en attente.');
    }
    finally {
        remoteSyncInFlight = false;
        if (queuedRemoteState) {
            window.clearTimeout(remoteSyncTimer);
            remoteSyncTimer = window.setTimeout(() => void flushQueuedRemoteState(), 5000);
        }
    }
}
function queueRemoteWorkspace(state) {
    queuedRemoteState = state;
    localStorage.setItem(getPendingSyncKey(), JSON.stringify(state));
    window.clearTimeout(remoteSyncTimer);
    remoteSyncTimer = window.setTimeout(() => void flushQueuedRemoteState(), 80);
}
async function saveLocal(state) {
    const nextState = {
        ...state,
        schemaVersion: SCHEMA_VERSION,
        workspaceUpdatedAt: new Date().toISOString(),
    };
    // L'enregistrement local doit toujours réussir immédiatement. Une panne
    // Firestore ne bloque plus l'interface ni la génération des PDF.
    localStorage.setItem(getStorageKey(), JSON.stringify(nextState));
    dispatchRemoteSync(nextState);
    queueRemoteWorkspace(nextState);
}
function getWorkspaceTimestamp(state) {
    const value = state?.workspaceUpdatedAt;
    if (!value)
        return 0;
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
}
async function syncWorkspaceNow() {
    const pendingRaw = localStorage.getItem(getPendingSyncKey());
    if (pendingRaw) {
        try {
            queuedRemoteState = migrateState(JSON.parse(pendingRaw));
            await flushQueuedRemoteState();
            return queuedRemoteState ? 'pending' : 'synced';
        }
        catch {
            localStorage.removeItem(getPendingSyncKey());
        }
    }
    try {
        const remote = await loadRemoteWorkspace();
        const local = loadExistingLocal();
        if (remote && (!local || getWorkspaceTimestamp(remote) > getWorkspaceTimestamp(local))) {
            localStorage.setItem(getStorageKey(), JSON.stringify(remote));
            dispatchRemoteSync(remote);
            dispatchCloudSyncStatus('synced');
            return 'updated';
        }
        if (local && !remote) {
            queueRemoteWorkspace(local);
            await flushQueuedRemoteState();
            return queuedRemoteState ? 'pending' : 'synced';
        }
        dispatchCloudSyncStatus('synced');
        return 'synced';
    }
    catch {
        dispatchCloudSyncStatus('pending', 'Connexion cloud indisponible.');
        return navigator.onLine ? 'pending' : 'offline';
    }
}
function openFileDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(FILE_DB_NAME, 1);
        request.onupgradeneeded = () => {
            const database = request.result;
            if (!database.objectStoreNames.contains(FILE_STORE_NAME))
                database.createObjectStore(FILE_STORE_NAME);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Impossible d’ouvrir le stockage local des fichiers.'));
    });
}
async function saveLocalFile(id, file) {
    const database = await openFileDatabase();
    await new Promise((resolve, reject) => {
        const transaction = database.transaction(FILE_STORE_NAME, 'readwrite');
        transaction.objectStore(FILE_STORE_NAME).put(file, id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Impossible de sauvegarder le fichier localement.'));
    });
    database.close();
}
async function readLocalFile(id) {
    const database = await openFileDatabase();
    const result = await new Promise((resolve, reject) => {
        const transaction = database.transaction(FILE_STORE_NAME, 'readonly');
        const request = transaction.objectStore(FILE_STORE_NAME).get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error ?? new Error('Impossible de lire le fichier local.'));
    });
    database.close();
    return result;
}
async function deleteLocalFile(id) {
    const database = await openFileDatabase();
    await new Promise((resolve, reject) => {
        const transaction = database.transaction(FILE_STORE_NAME, 'readwrite');
        transaction.objectStore(FILE_STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Impossible de supprimer le fichier local.'));
    });
    database.close();
}
async function loadAppData() {
    const cached = loadCachedLocal();
    if (cached) {
        const pendingRaw = localStorage.getItem(getPendingSyncKey());
        if (pendingRaw) {
            try {
                queuedRemoteState = migrateState(JSON.parse(pendingRaw));
                void flushQueuedRemoteState();
            }
            catch {
                localStorage.removeItem(getPendingSyncKey());
            }
        }
        void loadRemoteWorkspace()
            .then((remote) => {
            if (!remote)
                return;
            const pending = Boolean(localStorage.getItem(getPendingSyncKey()));
            if (pending && getWorkspaceTimestamp(cached) >= getWorkspaceTimestamp(remote))
                return;
            if (getWorkspaceTimestamp(remote) >= getWorkspaceTimestamp(cached)) {
                localStorage.setItem(getStorageKey(), JSON.stringify(remote));
                dispatchRemoteSync(remote);
            }
        })
            .catch(() => dispatchCloudSyncStatus('pending', 'Synchronisation cloud en attente.'));
        return cached;
    }
    const remote = await loadRemoteWorkspace();
    if (remote) {
        localStorage.setItem(getStorageKey(), JSON.stringify(remote));
        return remote;
    }
    const migratedLegacy = loadLegacyAccountLocal();
    if (migratedLegacy) {
        localStorage.setItem(getStorageKey(), JSON.stringify(migratedLegacy));
        await saveRemoteWorkspace(migratedLegacy);
        return migratedLegacy;
    }
    const local = loadLocal();
    await saveRemoteWorkspace(local);
    return local;
}
async function saveProject(project) {
    const state = loadLocal();
    const index = state.projects.findIndex((item) => item.id === project.id);
    if (index >= 0)
        state.projects[index] = project;
    else
        state.projects.push(project);
    await saveLocal(state);
}
async function removeProject(projectId) {
    const state = loadLocal();
    state.projects = state.projects.filter((item) => item.id !== projectId);
    state.documents = state.documents.filter((item) => item.projectId !== projectId);
    await saveLocal(state);
}
async function saveLot(lot) {
    const state = loadLocal();
    const index = state.lots.findIndex((item) => item.id === lot.id);
    const nextLots = index >= 0
        ? state.lots.map((item) => item.id === lot.id ? lot : item)
        : [...state.lots, lot];
    state.lots = (0, lots_1.normalizeLotOrders)(nextLots);
    await saveLocal(state);
    return state.lots;
}
async function removeLot(lotId) {
    const state = loadLocal();
    state.lots = (0, lots_1.normalizeLotOrders)(state.lots.filter((item) => item.id !== lotId));
    await saveLocal(state);
    return state.lots;
}
async function saveArtisan(artisan) {
    const state = loadLocal();
    const index = state.artisans.findIndex((item) => item.id === artisan.id);
    if (index >= 0)
        state.artisans[index] = artisan;
    else
        state.artisans.push(artisan);
    await saveLocal(state);
}
async function removeArtisan(artisanId) {
    const state = loadLocal();
    state.artisans = state.artisans.filter((item) => item.id !== artisanId);
    await saveLocal(state);
}
async function saveTask(task) {
    const state = loadLocal();
    const index = state.tasks.findIndex((item) => item.id === task.id);
    if (index >= 0)
        state.tasks[index] = task;
    else
        state.tasks.push(task);
    await saveLocal(state);
}
async function removeTask(taskId) {
    const state = loadLocal();
    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    await saveLocal(state);
}
async function saveCalendarEvent(event) {
    const state = loadLocal();
    const index = state.calendarEvents.findIndex((item) => item.id === event.id);
    if (index >= 0)
        state.calendarEvents[index] = event;
    else
        state.calendarEvents.push(event);
    await saveLocal(state);
}
async function removeCalendarEvent(eventId) {
    const state = loadLocal();
    state.calendarEvents = state.calendarEvents.filter((item) => item.id !== eventId);
    await saveLocal(state);
}
async function uploadDocument(file, input) {
    const id = crypto.randomUUID();
    const sizeLabel = file.size > 1000000
        ? `${(file.size / 1000000).toFixed(1)} Mo`
        : `${Math.max(1, Math.round(file.size / 1000))} Ko`;
    const saved = {
        ...input,
        id,
        uploadedAt: new Date().toISOString().slice(0, 10),
        sizeLabel,
        mimeType: file.type || undefined,
        localFileId: id,
    };
    await saveLocalFile(id, file);
    const state = loadLocal();
    state.documents.unshift(saved);
    await saveLocal(state);
    return saved;
}
async function moveDocumentCategory(documentId, category) {
    const state = loadLocal();
    const index = state.documents.findIndex((item) => item.id === documentId);
    if (index < 0)
        throw new Error('Le document à déplacer est introuvable.');
    const moved = { ...state.documents[index], category };
    state.documents[index] = moved;
    await saveLocal(state);
    return moved;
}
async function removeDocument(documentId) {
    const state = loadLocal();
    const document = state.documents.find((item) => item.id === documentId);
    if (!document)
        throw new Error('Le document à supprimer est introuvable.');
    if (document.localFileId)
        await deleteLocalFile(document.localFileId);
    state.documents = state.documents.filter((item) => item.id !== documentId);
    await saveLocal(state);
}
async function getLocalDocumentBlob(document) {
    if (!document.localFileId)
        throw new Error('Aucun fichier local réel n’est associé à ce document.');
    const blob = await readLocalFile(document.localFileId);
    if (!blob)
        throw new Error(`Le fichier « ${document.name} » est introuvable sur cet ordinateur.`);
    return blob;
}
async function saveArtisanConvention(file) {
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf)
        throw new Error('La convention doit être un fichier PDF.');
    const localFileId = `convention-${crypto.randomUUID()}`;
    await saveLocalFile(localFileId, file);
    return { localFileId, name: file.name, mimeType: file.type || undefined };
}
async function getArtisanConventionBlob(artisan) {
    if (!artisan.conventionLocalFileId)
        throw new Error(`Aucune convention n’est enregistrée pour ${artisan.company}.`);
    const blob = await readLocalFile(artisan.conventionLocalFileId);
    if (!blob)
        throw new Error(`La convention de ${artisan.company} est introuvable sur cet ordinateur.`);
    return blob;
}
async function getDocumentUrl(document) {
    if (!document.localFileId)
        throw new Error('Aucun fichier local réel n’est associé à ce document.');
    const blob = await readLocalFile(document.localFileId);
    if (!blob)
        throw new Error('Le fichier local est introuvable. Il a peut-être été effacé par le navigateur.');
    return { url: URL.createObjectURL(blob), temporary: true };
}
function loadDismissedLocal() {
    const raw = localStorage.getItem(getDismissedAlertsKey());
    if (!raw)
        return [];
    try {
        const value = JSON.parse(raw);
        return Array.isArray(value) ? value.filter((item) => typeof item === 'string') : [];
    }
    catch {
        return [];
    }
}
async function loadDismissedNotificationIds() {
    const local = loadDismissedLocal();
    const accountKey = (0, auth_1.getCurrentAccountKey)();
    if (!accountKey)
        return local;
    const remote = await withTimeout((0, firebase_1.loadUserDismissedAlerts)(accountKey), 600);
    if (!remote)
        return local;
    localStorage.setItem(getDismissedAlertsKey(), JSON.stringify(remote));
    return remote;
}
async function dismissNotification(notificationId) {
    const current = new Set(loadDismissedLocal());
    current.add(notificationId);
    const ids = Array.from(current);
    localStorage.setItem(getDismissedAlertsKey(), JSON.stringify(ids));
    const accountKey = (0, auth_1.getCurrentAccountKey)();
    if (accountKey)
        await (0, firebase_1.saveUserDismissedAlerts)(accountKey, ids);
}
function resetDemoData() {
    const seed = cloneSeed();
    saveLocal(seed);
    localStorage.removeItem(getDismissedAlertsKey());
    return seed;
}

},
"src/main": function(module, exports, require) {
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const client_1 = require("react-dom/client");
const App_1 = __importDefault(require("./App"));

const cleanStart_1 = require("./lib/cleanStart");
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => void navigator.serviceWorker.register('./service-worker.js'));
}
async function bootstrap() {
    const resetting = await (0, cleanStart_1.performOneTimeBrowserReset)();
    if (resetting)
        return;
    (0, client_1.createRoot)(document.getElementById('root')).render((0, jsx_runtime_1.jsx)(react_1.StrictMode, { children: (0, jsx_runtime_1.jsx)(App_1.default, {}) }));
}
void bootstrap();

},
"src/types/index": function(module, exports, require) {
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

}

};
const cache = Object.create(null);
function normalize(value) {
  const parts = [];
  for (const part of value.split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return parts.join('/');
}
function resolve(request, parent) {
  if (request === 'react' || request === 'react/jsx-runtime' || request === 'react-dom/client') return request;
  if (!request.startsWith('.')) return request;
  const base = parent.split('/').slice(0, -1).join('/');
  const candidate = normalize(base + '/' + request).replace(/\.js$/, '');
  if (modules[candidate]) return candidate;
  if (modules[candidate + '/index']) return candidate + '/index';
  throw new Error('Module introuvable : ' + request + ' depuis ' + parent);
}
function load(id, parent = '') {
  const resolved = parent ? resolve(id, parent) : id;
  if (resolved === 'react') return global.React;
  if (resolved === 'react/jsx-runtime') return global.ReactJSXRuntime;
  if (resolved === 'react-dom/client') return global.ReactDOM;
  if (!modules[resolved]) throw new Error('Module introuvable : ' + resolved);
  if (cache[resolved]) return cache[resolved].exports;
  const module = { exports: {} };
  cache[resolved] = module;
  modules[resolved](module, module.exports, (request) => load(request, resolved));
  return module.exports;
}
load('src/main');
})(window);
