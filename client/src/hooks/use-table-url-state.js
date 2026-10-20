import { useMemo, useState } from 'react';
export function useTableUrlState(params) {
    const { search, navigate, pagination: paginationCfg, globalFilter: globalFilterCfg, columnFilters: columnFiltersCfg = [], } = params;
    const pageKey = paginationCfg?.pageKey ?? 'page';
    const pageSizeKey = paginationCfg?.pageSizeKey ?? 'pageSize';
    const defaultPage = paginationCfg?.defaultPage ?? 1;
    const defaultPageSize = paginationCfg?.defaultPageSize ?? 10;
    const globalFilterKey = globalFilterCfg?.key ?? 'filter';
    const globalFilterEnabled = globalFilterCfg?.enabled ?? true;
    const trimGlobal = globalFilterCfg?.trim ?? true;
    // Build initial column filters from the current search params
    const initialColumnFilters = useMemo(() => {
        const collected = [];
        for (const cfg of columnFiltersCfg) {
            const raw = search[cfg.searchKey];
            const deserialize = cfg.deserialize ?? ((v) => v);
            if (cfg.type === 'string') {
                const value = deserialize(raw) ?? '';
                if (typeof value === 'string' && value.trim() !== '') {
                    collected.push({ id: cfg.columnId, value });
                }
            }
            else {
                // default to array type
                const value = deserialize(raw) ?? [];
                if (Array.isArray(value) && value.length > 0) {
                    collected.push({ id: cfg.columnId, value });
                }
            }
        }
        return collected;
    }, [columnFiltersCfg, search]);
    const [columnFilters, setColumnFilters] = useState(initialColumnFilters);
    const pagination = useMemo(() => {
        const rawPage = search[pageKey];
        const rawPageSize = search[pageSizeKey];
        const pageNum = typeof rawPage === 'number' ? rawPage : defaultPage;
        const pageSizeNum = typeof rawPageSize === 'number' ? rawPageSize : defaultPageSize;
        return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum };
    }, [search, pageKey, pageSizeKey, defaultPage, defaultPageSize]);
    const onPaginationChange = (updater) => {
        const next = typeof updater === 'function' ? updater(pagination) : updater;
        const nextPage = next.pageIndex + 1;
        const nextPageSize = next.pageSize;
        navigate({
            search: (prev) => ({
                ...prev,
                [pageKey]: nextPage <= defaultPage ? undefined : nextPage,
                [pageSizeKey]: nextPageSize === defaultPageSize ? undefined : nextPageSize,
            }),
        });
    };
    const [globalFilter, setGlobalFilter] = useState(() => {
        if (!globalFilterEnabled)
            return undefined;
        const raw = search[globalFilterKey];
        return typeof raw === 'string' ? raw : '';
    });
    const onGlobalFilterChange = globalFilterEnabled
        ? (updater) => {
            const next = typeof updater === 'function'
                ? updater(globalFilter ?? '')
                : updater;
            const value = trimGlobal ? next.trim() : next;
            setGlobalFilter(value);
            navigate({
                search: (prev) => ({
                    ...prev,
                    [pageKey]: undefined,
                    [globalFilterKey]: value ? value : undefined,
                }),
            });
        }
        : undefined;
    const onColumnFiltersChange = (updater) => {
        const next = typeof updater === 'function' ? updater(columnFilters) : updater;
        setColumnFilters(next);
        const patch = {};
        for (const cfg of columnFiltersCfg) {
            const found = next.find((f) => f.id === cfg.columnId);
            const serialize = cfg.serialize ?? ((v) => v);
            if (cfg.type === 'string') {
                const value = typeof found?.value === 'string' ? found.value : '';
                patch[cfg.searchKey] =
                    value.trim() !== '' ? serialize(value) : undefined;
            }
            else {
                const value = Array.isArray(found?.value)
                    ? found.value
                    : [];
                patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined;
            }
        }
        navigate({
            search: (prev) => ({
                ...prev,
                [pageKey]: undefined,
                ...patch,
            }),
        });
    };
    const ensurePageInRange = (pageCount, opts = { resetTo: 'first' }) => {
        const currentPage = search[pageKey];
        const pageNum = typeof currentPage === 'number' ? currentPage : defaultPage;
        if (pageCount > 0 && pageNum > pageCount) {
            navigate({
                replace: true,
                search: (prev) => ({
                    ...prev,
                    [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
                }),
            });
        }
    };
    return {
        globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
        onGlobalFilterChange,
        columnFilters,
        onColumnFiltersChange,
        pagination,
        onPaginationChange,
        ensurePageInRange,
    };
}
