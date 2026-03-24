import EntryEditory from "./EntryEditor"

export default async function EntryPage({ params }: { params: Promise<{ date: string }> }) {
    const { date } = await params;
    return <EntryEditory date={date} />;
}
