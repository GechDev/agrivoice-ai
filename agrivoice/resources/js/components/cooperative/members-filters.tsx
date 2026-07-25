import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { StatusOption } from '@/types/cooperative-members';

type MembersFiltersProps = {
    search: string;
    status: string;
    statusOptions: StatusOption[];
    onSearchChange: (value: string) => void;
    onStatusChange: (value: string) => void;
};

export function MembersFilters({
    search,
    status,
    statusOptions,
    onSearchChange,
    onStatusChange,
}: MembersFiltersProps) {
    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Label htmlFor="members-search">Search members</Label>
                <div className="relative">
                    <Search
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                    />
                    <Input
                        id="members-search"
                        type="search"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search by name or phone"
                        className="pl-9"
                        autoComplete="off"
                    />
                </div>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-52">
                <Label htmlFor="members-status">Status</Label>
                <Select
                    value={status || 'all'}
                    onValueChange={(value) =>
                        onStatusChange(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger
                        id="members-status"
                        className="w-full"
                        aria-label="Filter by status"
                    >
                        <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All statuses</SelectItem>
                        {statusOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
