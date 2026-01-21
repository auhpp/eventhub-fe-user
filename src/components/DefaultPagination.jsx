import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationLink, PaginationNext }
    from "./ui/pagination";

const DefaultPagination = ({
    totalPages, currentPage, setSearchParams, pageSize, totalElements
}) => {
    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setSearchParams((prev) => {
            prev.set("page", page);
            return prev;
        });
    };
    return (
        <div className="flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">
                Hiển thị <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> đến
                <span className="font-medium text-foreground"> {Math.min(currentPage * pageSize, totalElements)}</span> trong số
                <span className="font-medium text-foreground"> {totalElements}</span> kết quả
            </p>
            <Pagination className="w-auto m-0">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            onClick={() => handlePageChange(currentPage - 1)}
                            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {

                        if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        isActive={page === currentPage}
                                        onClick={() => handlePageChange(page)}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            );
                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                            return <PaginationItem key={page}>...</PaginationItem>
                        }
                        return null;
                    })}
                    <PaginationItem>
                        <PaginationNext
                            onClick={() => handlePageChange(currentPage + 1)}
                            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    )
}

export default DefaultPagination;