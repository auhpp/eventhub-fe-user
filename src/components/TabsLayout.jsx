import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

const TabsLayout = ({ tabs, setActiveTab, activeTab, content }) => {
    return (
        <>
            <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex bg-muted/60 p-1 mb-6">
                    {
                        tabs.map(
                            tab => (
                                <TabsTrigger value={tab.value}>{tab.label}</TabsTrigger>
                            )
                        )
                    }
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {content}
                </TabsContent>
            </Tabs>
        </>
    )
}

export default TabsLayout;