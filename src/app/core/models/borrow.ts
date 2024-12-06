export interface Borrow {
    id: string;
    bookId: string;
    userId: string;
    borrowDate: Date;
    dueDate: Date;
    returnDate?: Date;
    status: BorrowStatus;
}

export enum BorrowStatus {
    BORROWED = 'BORROWED',
    RETURNED = 'RETURNED',
    OVERDUE = 'OVERDUE'
}
